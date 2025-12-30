export type FetchResult = {
  url: string;
  status: number;
  contentType: string;
  text: string;
};

export async function fetchUrl(url: string): Promise<FetchResult> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "Terra/0.1 (+https://github.com/your-org/terra)"
    }
  });

  const contentType = res.headers.get("content-type") ?? "text/plain";
  const text = await res.text();

  return {
    url: res.url || url,
    status: res.status,
    contentType,
    text
  };
}
