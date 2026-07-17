import { htmlToPlainText } from "../src/html-to-plain-text.js";

const hangerHtml = `<p><span style="font-size: 14px; color: #000000;">Keep your hair extensions safe, undamaged and tangle-free with our clip-in hair extension hanger and case here at Foxy Locks. Made with grip padding, our hair extension hanger holds extension wefts securely, making brushing and styling your extensions quick and easy. It&rsquo;s also perfect for air-drying your extensions after washing them! Our hair extension case and hanger is perfect for styling and storing your hair extensions at home, as well as keeping them protected and ready-to-wear when travelling.</span></p>
<ul>
<li><span style="font-size: 14px; color: #000000;">Hook for easy styling of your extensions</span></li>
<li><span style="font-size: 14px; color: #000000;">Extremely lightweight &amp; discreet</span></li>
<li><span style="font-size: 14px; color: #000000;">Can be folded or rolled up</span></li>
<li><span style="font-size: 14px; color: #000000;">Perfect for travelling</span></li>
<li><span style="font-size: 14px; color: #000000;">Case - 13.5" W x 24.5" L</span></li>
<li><span style="font-size: 14px; color: #000000;">Hanger - 10" W x 6.5" L</span></li>
</ul>`;

const plain = htmlToPlainText(hangerHtml);

const checks = [
  ["no HTML tags", !/<[a-z]/i.test(plain)],
  ["decodes rsquo", plain.includes("It's")],
  ["decodes amp", plain.includes("lightweight & discreet")],
  ["includes list line", plain.includes("Hook for easy styling")],
  ["includes dimensions", plain.includes('Case - 13.5" W')],
];

let failed = false;
for (const [name, ok] of checks) {
  if (!ok) {
    console.error(`FAIL: ${name}`);
    failed = true;
  }
}

if (failed) {
  console.log("Output:\n", plain);
  process.exit(1);
}

console.log("Plain-text description conversion OK.");
console.log(plain);
