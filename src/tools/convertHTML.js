import * as cheerio from "cheerio"

export default function convertHtml(html) {
  const $ = cheerio.load(html)
  $("img")
    .unwrap()
    .replaceWith((i, e) => {
      const { src, alt, title, width, height } = e.attribs
      if (title)
        return `<figure style="padding-top:16px;padding-bottom:16px;">
      <center>
          <img
            src=${src}
            alt=${alt}
            width=100%
            loading="lazy"
            title=${alt}
            width=${width}
            height=${height}
            decoding="auto"
           />
          <figcaption><em>${title}</em></figcaption></center>
          </figure>`
      return `<img
          src=${src}
          alt=${alt}
          loading="lazy"
          width=${width}
          height=${height} 
          decoding="auto"
          />`
    })

  return $.html()
}