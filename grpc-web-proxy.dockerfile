FROM alpine:3.16

ENV PROXY_VERSION=0.15.0

RUN apk add --update --no-cache curl unzip && \
    curl -fsSL https://github.com/improbable-eng/grpc-web/releases/download/v${PROXY_VERSION}/grpcwebproxy-v${PROXY_VERSION}-linux-x86_64.zip -o /proxy.zip && \
    unzip /proxy.zip && \
    mv dist/grpc* /usr/local/grpcwebproxy && \
    rm -rf /proxy.zip /dist

ENTRYPOINT [ "/usr/local/grpcwebproxy" ]
