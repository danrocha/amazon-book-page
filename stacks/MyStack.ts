import * as sst from "@serverless-stack/resources";
import * as lambda from "aws-cdk-lib/aws-lambda";

const layerArn =
  "arn:aws:lambda:us-east-1:764866452798:layer:chrome-aws-lambda:22";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const layer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "Layer",
      layerArn
    );
    // Create a HTTP API
    const api = new sst.Api(this, "Api", {
      routes: {
        "GET /amazon/book": {
          function: "src/amazon/book.handler",
          timeout: 15,
          // load Chrome in a layer
          layers: [layer],
          bundle: {
            externalModules: ["chrome-aws-lambda"],
          },
        },
      },
    });

    // Show the endpoint in the output
    this.addOutputs({
      ApiEndpoint: api.url,
    });
  }
}
