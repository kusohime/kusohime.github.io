import type { DialogueProfile } from "./dialogueTypes";

const cui = { name: "脆", self: true };
const kuma = { name: "熊", self: false };
const a = { name: "A", self: false };
const b = { name: "B", self: false };
const he = { name: "贺", self: false };
const yao = { name: "瑶", self: false };
const zha = { name: "查", self: false };

// The early transcripts omit sender names. Their sequences preserve separate
// voices and use A/B where an identity cannot be recovered from the archive.
// The cup-avatar screenshots establish 美姬 and 外翻脆脆 as Cui's names.
export const dialogueTrilogues: Record<string, DialogueProfile> = {
  "ben-qun-1": {
    keyword: { zh: "神谵", en: "Divine Delirium" },
    speakerAliases: { 本瘋才: { name: "本瘋才", self: false } },
    unknownSpeakers: [cui, a, cui],
    motifs: [
      { from: "神々の沈黙", to: "燃燒的灌木開始還是 intrapersonal maya", label: "神的缄默／启示", side: "left", dotted: true }, // Silence and revelation are a conceptual association.
      { from: "致幻藝術家", to: "聖安東尼之火", label: "幻觉的文明史", side: "left" },
    ],
  },
  "ben-qun-2": {
    keyword: { zh: "名咒", en: "Name as Spell" },
    unknownSpeakers: [he, kuma, kuma, he, cui],
    motifs: [
      { from: "殺人容易拋屍難", to: "神啟萬物死", label: "抛尸／神启万物死", side: "left", dotted: true }, // Death links the quotation and incantation without an explicit reprise.
      { from: "theonym 意義上叫你一下", to: "伴珠默唸四萬三千遍", label: "神名／念诵", side: "left" },
      { from: "酒神式感動之 mystagogy", to: "大能名諱", label: "秘仪与名讳", side: "left", dotted: true }, // A ritual association, weaker than the explicit theonym/name sequence.
    ],
  },
  "ben-qun-3": {
    keyword: { zh: "共咒", en: "Mutual Cursing" },
    // User-authorized editorial assignment: keep the first group's A/B voices
    // consistent as 贺/瑶, then assign the new post-quotation group to 瑶.
    unknownSpeakers: [he, cui, yao, he, cui, yao, he, yao, cui, yao, cui, kuma],
    motifs: [
      { from: "我要找個保鏢結婚", to: "如果一個人每天早上起來第一件事情是扎我的小人我會覺得很幸福", fromSpeaker: "脆", toSpeaker: "脆", label: "保护与诅咒", side: "left", dotted: true }, // Protection and cursing form an inferred inversion across the exchange.
      { from: "恨比愛長久", to: "恨也是一種愛", label: "恨／爱反转", side: "left" },
      { from: "扎我的小人", to: "扎你唧唧", fromSpeaker: "脆", toSpeaker: "熊", label: "扎小人与扎唧唧", side: "right" },
    ],
  },
  "ben-qun-4": {
    keyword: { zh: "同名处决", en: "Homonymic Execution" },
    // The historical passage is an external quotation, not a third speaker.
    unknownSpeakers: [cui, yao, yao, cui],
    motifs: [
      { from: "趙國永遠不降", to: "將上黨送給趙國", label: "赵国重现", side: "left" },
      { from: "給小學雞塗髒髒的裸色", to: "韓國雖小，卻是一個", label: "韩国／韩国同名滑移", side: "left" },
      { from: "然而，韓國還是先天缺陷", to: "萬鍾不辨禮義而受之", label: "古典语句的变体", side: "left" },
    ],
  },
  "ben-qun-5": {
    keyword: { zh: "零次复调", en: "Zero-Love Polyphony" },
    speakerAliases: {
      美姬: cui,
      糞姬: cui,
      "外翻脆脆（收徒）": cui,
      "外翻脆脆(收徒)": cui,
      Harlan: { name: "Harlan", self: false },
      serpentofarabia: { name: "serpentofarabia", self: false },
      莘音: { name: "孽畜", self: false },
      萃音: { name: "孽畜", self: false },
      孽畜: { name: "孽畜", self: false },
      Cpt: { name: "Cpt", self: false },
      愤怒的男模: { name: "愤怒的男模", self: false },
    },
    motifs: [
      { from: "昨天梦到本群了", to: "昨天梦到本群了", fromSpeaker: "脆", toSpeaker: "Harlan", label: "共享的梦", side: "right" },
      { from: "本群复调阶段", to: "本群各有所转但只会爱零次", fromSpeaker: "serpentofarabia", toSpeaker: "脆", label: "复调与零次爱", side: "left", dotted: true }, // Polyphony describes a structural echo, rather than a shared proposition.
      { from: "本群各有所转但只会爱零次", to: "本群各有所转但只会爱零次", fromSpeaker: "脆", toSpeaker: "serpentofarabia", label: "零次爱的齐声", side: "right" },
    ],
  },
  "ben-qun-6": {
    keyword: { zh: "同词异指", en: "Shared Word, Split Referents" },
    speakerAliases: {
      脆: cui,
      美姬: cui,
      糞姬: cui,
      熊: kuma,
      serpentofarabia: { name: "serpentofarabia", self: false },
    },
    motifs: [
      { from: "我们不是一个性别啦", to: "我们都不是一个性别", fromSpeaker: "脆", toSpeaker: "serpentofarabia", label: "不同性别的复调", side: "right" },
      { from: "我们都不是一个性别", to: "所指各有千秋", fromSpeaker: "serpentofarabia", toSpeaker: "脆", label: "性别／所指", side: "left" },
    ],
  },
  "ben-qun-7": {
    keyword: { zh: "福咒", en: "Blessing-Curse" },
    // All four messages are external quotations; no chat voice is invented.
    motifs: [
      { from: "诅咒与祝福", to: "但我依然祝福你，并且诅咒你", label: "祝福与诅咒", side: "left" },
      { from: "墓地から出してもよい", to: "在莲生大师即将化为白骨的那一刻迅速的再次冰封", label: "墓地与冰封", side: "right", dotted: true }, // Reanimation and suspended death are cross-source images.
    ],
  },
  "ben-qun-8a": {
    keyword: { zh: "拒绝人类", en: "Human Refusal" },
    unknownSpeakers: [zha, kuma, cui, cui, he],
    motifs: [
      { from: "shared inner genius for the eternal chaos of new mythology", to: "aura farming 是不是就是審美積累", label: "新神话与审美积累", side: "left", dotted: true }, // A broad aesthetic association between otherwise distinct passages.
      { from: "不敢想", to: "不曾想", fromSpeaker: "脆", toSpeaker: "脆", label: "不敢想／不曾想", side: "right" },
      { from: "我是人第二人是哺乳動物第三哺乳動物是兩性有性繁殖", to: "in mpreg midbirth orgasm dynamite we trust", label: "繁殖的拒绝与反转", side: "right", dotted: true }, // A thematic inversion across separate quoted sources.
    ],
  },
  "ben-qun-8b": {
    keyword: { zh: "共脑造神", en: "Hive-Mind Theogenesis" },
    speakerAliases: { 脆: cui, 熊: kuma, centerforthings: { name: "centerforthings", self: false } },
    unknownSpeakers: [cui, kuma, cui, a, kuma, cui, cui, kuma, a, kuma, cui, a, cui],
    motifs: [
      { from: "我覺得這個世界上一共有四種故事", to: "魔法少女小圓裡發生了全部四種故事", fromSpeaker: "脆", toSpeaker: "脆", label: "四种故事的重述", side: "right" },
      { from: "我們噴過的人裡面有哪幾個真的活得很爽的", to: "我們愛的人裡面有哪幾個活得跟狗一樣的", fromSpeaker: "脆", toSpeaker: "脆", label: "爱与诅咒的镜像", side: "left" },
      { from: "本群腦共時了", to: "被我們四維工程了", label: "共脑／四维工程", side: "left", dotted: true }, // Group synchrony and causal engineering share an implied metaphor.
      { from: "我perdure了", to: "我ordure了", fromSpeaker: "熊", toSpeaker: "脆", label: "持续／秽物的词形变奏", side: "left" },
    ],
  },
  "ben-qun-9": {
    keyword: { zh: "童年复位", en: "Childhood Reset" },
    speakerAliases: { C: cui, H: { name: "贺", self: false }, X: kuma, 畫外音: { name: "畫外音", self: false } },
    motifs: [],
  },
};
