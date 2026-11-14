import { churchAnthem } from "./hymns/church-anthem";
import { englishHymns1To10 } from "./hymns/english-01-10";
import { englishHymns11To20 } from "./hymns/english-11-20";
import { englishHymns21To23 } from "./hymns/english-21-23";
import { languages, englishTopics, yorubaTopics } from "./hymns/topics";
import { yorubaHymns1To10 } from "./hymns/yoruba-01-10";
import { yorubaHymns11To20 } from "./hymns/yoruba-11-20";
import { yorubaHymns21To23 } from "./hymns/yoruba-21-23";

export { churchAnthem, englishTopics, languages, yorubaTopics };
export const suppliedHymns = [
  ...englishHymns1To10,
  ...englishHymns11To20,
  ...englishHymns21To23,
  ...yorubaHymns1To10,
  ...yorubaHymns11To20,
  ...yorubaHymns21To23,
];
