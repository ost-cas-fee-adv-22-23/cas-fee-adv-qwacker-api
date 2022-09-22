import { ZitadelIntrospectionStrategy } from './src/auth/passport.strategy';

const jwt = new ZitadelIntrospectionStrategy({
  authority: 'https://cas-fee-advanced-ocvdad.zitadel.cloud',
  authorization: {
    type: 'jwt-profile',
    profile: {
      type: 'application',
      keyId: '179935858898501889',
      key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEogIBAAKCAQEAsqmcXEN+iuvcFbXkNNOTqTjy+rJ5OWro2sa0b/upDQ4gODLA\nHGPO5aV1o28hbRDEJZu2UpQu5ZJdhyPTYRPrT/Tunf1ySe6gmvuwO8aaYcf+JTRF\nkoj4iSUr3c4KdqADjQWPcnJBLT6KAhV8ShxJWmAisgWmIHbfA2+X/7Rz1AKNO1cp\nbmCmKCJP6hBhmTz3P9PTMtm2HH8ILdGslOP9ZtMzH3tlwPo3N4zlW0YApYY7BJ/T\n7LpzX4Mi7r1mlKGv9X9MVbn/TQgKIuYe7xP0ZX9iSrfzC4ihOxx13/kTu74T41uH\n0aLYxNuRv+ZnaUX56XatLjui8kEKMCxQTxiplwIDAQABAoIBADFbS/ftKXNFb1qM\nEkxJuvw/4FhDn9ut3kA6LrTVCEG0ClCcLJhrNkgY6qPI2qofvKBLIRY1G7OOOMpR\nql6iOxquppD86GrmQnYuW+RXnGSw9FPg2et+bXKt0y2GczuMPw7hX1yVlc3i/gtP\nVjO/FsCh2FPn3ZoQXNG9LXeVqX4C9A5AVSDuVPR/8RhWa7uwP+oD5CZilZ020jBl\n2MHyUDIan3NbbUcjLhzbjY0ujeYYikOgn5lmQijG+E2WaibEDv9CeGbT8AuKErua\n5IzJvcQezokl8kpOJk0mqJDsFo+wDKn3ChDX1pdTF09XAv/mQDyQMbICAJdc7CDX\nC0otE5ECgYEAyOhRgA/YFUZ65CZT8z6taS3+tsv+m/UDRCYt5YupxFxERxnS//RB\nBVbGlvzyi+/CyoFRkUGddn0Y/iCDsMYB5BvCVal9VYCfAnUByl0HnwStcWzOrQsG\nS1hqmM8r8kUd8iCtmK2hMADsRr1i5TP0CDflfdo9N/WUKEZKumCfAs8CgYEA46ez\nFIQ5Nx/w5ZMS7ECg89RiR5+A4GHRYEyVqfB7XNKx2nmXXUsyaUqHzX0M10TZ9YJK\nCyfMqoxYHU26Ot+o3PvAclzvvrC1dzCXQJ+z+wb303wvRenhGwgb7gLOznddxOP0\nVeG043Fn00hUyT9iUOYszZ6grVbzRvzh7/TGvrkCgYAHqGNC4Fe6J9+TRqq4gNEX\nSzuEOC5SP3qKZHInZ7Vm2KV5mFBklSjNTUtwgd+02cSw91DmmnuoAoirVw3t9P4p\nda1omnc+hRKKg284CWe69fCufBk8m0j4Ijyd6negWmYTzo8PXL7iF4bqA1n7polM\nruS+cU0YDvJAvr0mcXxeHQKBgENS07XMiHMR4hayUNVHI5IYC9xsghtZMicNXvE7\nqe/Aa1JVxPqVA1p57QFK6uI6fU6KckUsRu1kxaYc12cTv4did/4aF9hHv9J4rzIw\nSHSDEgUb44sEaEqrMj9H20rZqARS+W3waqMcZXzpFhHRycxs1XEVaST54sXqgRKK\nS8AZAoGAHUCeCrwRf/RKj03iWEwEb/BZ2BF1zAP4K73LjgK5wiclX3FxgFaal78y\nIUtjmKSkzETWP90FXjJUFWtPOxrg/binANLW7E+SSB7zIrwfGis8+V0G9wc/68vq\nyvY6GAcbDy+Vn3sBvJQToX7Lkm8X4fxuekLYPHr+mzFUPec7L8g=\n-----END RSA PRIVATE KEY-----\n',
      appId: '179832613186306305',
      clientId: '179832613186371841@cas_fee_adv_qwacker',
    },
  },
});

const basic = new ZitadelIntrospectionStrategy({
  authority: 'https://cas-fee-advanced-ocvdad.zitadel.cloud',
  authorization: {
    type: 'basic',
    clientId: '179958608300146945@cas_fee_adv_qwacker',
    clientSecret:
      '7qCV3ZtEx35IdFbij5mfIz6rE4lhkwi1ZnQGTaBICJEtjrNFGYgljHqtE0FOBuG8',
  },
});

const token =
  'VG4d3wROt7AzHtNFecJgfkpIM2k327HBHm8yf6Tea6ybgKmf4C92lxC-Cl5gfEa6znv6nuk';

(async () => {
  try {
    await jwt.authenticate({
      headers: { authorization: `Bearer ${token}` },
    } as any);
    console.log('jwt works');
  } catch (e) {
    console.error('jwt failed', e);
  }

  // try {
  //   await basic.authenticate({
  //     headers: { authorization: `Bearer ${token}` },
  //   } as any);
  //   console.log('basic works');
  // } catch (e) {
  //   console.error('basic failed', e);
  // }
})();
