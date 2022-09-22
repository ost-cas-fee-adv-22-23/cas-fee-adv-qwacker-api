import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { importPKCS8, SignJWT } from 'jose';
import * as NodeRSA from 'node-rsa';
import { ClientMetadata, IntrospectionResponse, Issuer } from 'openid-client';
import { Strategy } from 'passport';
import { ParsedQs } from 'qs';

type ZitadelJwtProfile = {
  type: 'application';
  keyId: string;
  key: string;
  appId: string;
  clientId: string;
};

type EndpointAuthoriztaion =
  | {
      type: 'basic';
      clientId: string;
      clientSecret: string;
    }
  | {
      type: 'jwt-profile';
      profile: ZitadelJwtProfile;
    };

export type ZitadelIntrospectionOptions = {
  authority: string;
  authorization: EndpointAuthoriztaion;
  discoveryEndpoint?: string;
};

export class ZitadelIntrospectionStrategy extends Strategy {
  name = 'zitadel-introspection';

  private introspect?: (token: string) => Promise<IntrospectionResponse>;

  constructor(private readonly options: ZitadelIntrospectionOptions) {
    super();
  }

  async authenticate(
    req: Request<
      ParamsDictionary,
      unknown,
      unknown,
      ParsedQs,
      Record<string, any>
    >,
  ) {
    if (
      !req.headers?.authorization ||
      req.headers?.authorization?.toLowerCase().startsWith('bearer ') === false
    ) {
      this.fail({ message: 'No bearer token found in authorization header' });
      return;
    }

    this.introspect ??= await this.getIntrospecter();

    const token = req.headers.authorization.substring(7);

    try {
      const result = await this.introspect(token);
      if (!result.active) {
        this.fail({ message: 'Token is not active' });
        return;
      }

      this.success(result);
    } catch (e) {
      this.error(e);
    }
  }

  private async getIntrospecter() {
    const issuer = await Issuer.discover(
      this.options.discoveryEndpoint ?? this.options.authority,
    );

    const options: ClientMetadata =
      this.options.authorization.type === 'basic'
        ? {
            client_id: this.options.authorization.clientId,
            client_secret: this.options.authorization.clientSecret,
            introspection_endpoint_auth_method: 'client_secret_basic',
          }
        : {
            client_id: this.options.authorization.profile.clientId,
            introspection_endpoint_auth_method: 'private_key_jwt',
          };

    const client = new issuer.Client(options);

    let jwt = '';
    let lastCreated = 0;

    const getPayload = async () => {
      if (this.options.authorization.type === 'basic') {
        return undefined;
      }

      // check if the last created time is older than 60 minutes, if so, create a new jwt.
      if (lastCreated < Date.now() - 60 * 60 * 1000) {
        const rsa = new NodeRSA(this.options.authorization.profile.key);
        const key = await importPKCS8(
          rsa.exportKey('pkcs8-private-pem'),
          'RSA256',
        );

        jwt = await new SignJWT({
          iss: options.client_id,
          sub: options.client_id,
          aud: this.options.authority,
        })
          .setExpirationTime('1h')
          .setProtectedHeader({
            alg: 'RS256',
            kid: this.options.authorization.profile.keyId,
          })
          .sign(key);
        lastCreated = Date.now();
      }

      return {
        clientAssertionPayload: {
          client_assertion_type:
            'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: jwt,
        },
      };
    };

    return async (token: string) =>
      client.introspect(token, 'access_token', await getPayload());
  }
}
