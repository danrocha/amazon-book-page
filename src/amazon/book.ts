import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import chrome from "chrome-aws-lambda";

const ext = "png";
const ContentType = `image/${ext}`;

// chrome-aws-lambda handles loading locally vs from the layer
const puppeteer = chrome.puppeteer;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  if (!event.queryStringParameters) {
    return createErrorResponse();
  }
  const { url } = event.queryStringParameters;
  if (!url) {
    return createErrorResponse();
  }

  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1200,
    height: 630,
  });

  //navigate to the url
  await page.goto(url);

  //wait for page to complete loding
  await page.evaluate("document.loaded");

  //take screenshot
  const buffer = await page.screenshot();
  if (buffer && typeof buffer !== "string") {
    return createResponse(buffer);
  }

  return createErrorResponse();
};

function createResponse(buffer: Buffer) {
  return {
    statusCode: 200,
    // return as binary data
    isBase64Encoded: true,
    body: buffer.toString("base64"),
    headers: { "Content-Type": ContentType },
  };
}

function createErrorResponse() {
  return {
    statusCode: 500,
    body: "Invalid request",
  };
}
