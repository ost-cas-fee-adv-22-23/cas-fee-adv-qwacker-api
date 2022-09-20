import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { Strategy, StrategyCreated, StrategyCreatedStatic } from 'passport';
import { ParsedQs } from 'qs';

export class ZitadelIntrospectionStrategy extends Strategy {
  authenticate(
    this: StrategyCreated<this, this & StrategyCreatedStatic>,
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    options?: any,
  ) {
    console.log('lol');
  }
}
