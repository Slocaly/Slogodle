import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
  type _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface R2Logo {
  key: string;
  url: string;
}

function getClient(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function listR2Logos(): Promise<R2Logo[]> {
  const client = getClient();
  const bucket = process.env.R2_BUCKET!;

  const objects: _Object[] = [];
  let continuationToken: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    );
    objects.push(...(page.Contents ?? []));
    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return Promise.all(
    objects
      .filter((object) => object.Key)
      .map(async (object) => ({
        key: object.Key!,
        url: await getSignedUrl(
          client,
          new GetObjectCommand({ Bucket: bucket, Key: object.Key! }),
          { expiresIn: 3600 },
        ),
      })),
  );
}
