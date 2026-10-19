import type { DialogueProfile } from "./dialogueTypes";

const cui = { name: "脆", self: true };
const kuma = { name: "熊", self: false };
const he = { name: "贺", self: false };

const namedSpeakers = {
  脆: cui,
  崔: cui,
  老残: cui,
  老殘: cui,
  文化苦女: cui,
  熊: kuma,
  贺: he,
  賀: he,
};

/**
 * These positions count rendered messages, including standalone quotations,
 * but exclude ellipsis dividers. A run of one speaker is intentional: the
 * archive's separate list items do not reliably represent alternating turns.
 */
export const dialogueLate: Record<string, DialogueProfile> = {
  "12": {
    keyword: { zh: "自厭自戀", en: "Narcissistic Self-Loathing" },
    unknownSpeakers: [cui, kuma],
    motifs: [
      {
        from: "本質一種 ego",
        to: "自我厭惡是最自戀沒救的行為",
        label: "自我厭惡的自戀結構",
        side: "left",
      },
      {
        from: "談戀愛到底是什麼樣",
        to: "感覺婚了一下",
        label: "未知的戀愛與既成的婚姻",
        side: "right",
      },
      {
        from: "原來邊緣控制叫 intense orgasm",
        to: "邊緣閃婚",
        label: "邊緣的語義轉調",
        side: "left",
      },
    ],
  },
  "13": {
    keyword: { zh: "戀知羞恥", en: "Epistemic Shame" },
    unknownSpeakers: [cui, kuma],
    // "在做曲式分析作業" identifies Cui; the reader returning from
    // Adorno and repeatedly renouncing philosophy is Kuma throughout.
    messageSpeakers: {
      2: cui, 3: kuma, 4: cui, 5: kuma, 6: cui, 7: kuma,
      8: cui, 9: kuma, 10: kuma, 11: cui,
      13: kuma, 14: cui, 15: kuma, 16: cui, 17: kuma, 18: cui,
      19: kuma, 20: cui, 21: kuma, 22: cui, 23: kuma,
      25: kuma, 26: cui, 27: kuma, 28: cui, 29: kuma, 30: cui,
      31: kuma, 32: cui, 33: kuma, 34: cui, 35: kuma, 36: cui,
    },
    motifs: [
      {
        from: "看了一下午阿多諾",
        to: "感覺讀了一下午這種東西回家路上把自己罵哭了",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "閱讀的熱情變成羞恥",
        side: "left",
      },
      {
        from: "false cognate 甲亢 BPD",
        to: "我們 reciprocal quoting 式聊天完全 false cognate momo 聊天",
        label: "假同源詞從診斷變成關係",
        side: "right",
      },
      {
        from: "再也不去圖書館了",
        to: "退休後可以在小區門口通往閩江的小河飯後散歩聽書學完",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "知識從圖書館退回河邊",
        side: "left",
        dotted: true, // An inferred contrast between institutional study and later listening.
      },
      {
        from: "我們童年。河邊的漫步學派",
        to: "福州地理",
        label: "童年地理成為主觀座標",
        side: "right",
        dotted: true, // The route and the later coordinates share a geographic association.
      },
    ],
  },
  "14": {
    keyword: { zh: "壽命換愛", en: "Love at Life’s Expense" },
    unknownSpeakers: [cui, kuma],
    motifs: [
      {
        from: "如果真的有壽命轉福祉的魔法",
        to: "脆狀體民族誌",
        label: "獻身的告白成為民族誌材料",
        side: "right",
        dotted: true, // The final ethnographic framing interprets the earlier confession.
      },
    ],
  },
  "15": {
    keyword: { zh: "紅點人格", en: "Red-Dot Selves" },
    unknownSpeakers: [kuma, cui],
    // The screen's owner answers "你不覺得我看起來完全不是這種人";
    // Kuma closes by observing Cui's multiplicity of characters.
    messageSpeakers: {
      1: kuma, 2: cui, 3: kuma, 4: cui, 5: kuma, 6: cui,
      8: kuma, 9: cui, 10: kuma,
    },
    motifs: [
      {
        from: "92 條未讀消息",
        to: "收得到，習慣好而已",
        label: "未讀的焦慮與清除的習慣",
        side: "right",
      },
      {
        from: "你不覺得我看起來完全不是這種人",
        to: "你沒有 ooc 的機會不是因為你沒有 キャラ 而是你擁有太多",
        fromSpeaker: "脆",
        toSpeaker: "熊",
        label: "人設的落差變成角色的過剩",
        side: "right",
      },
    ],
  },
  "16": {
    keyword: { zh: "字體性癖", en: "Typographic Desire" },
    unknownSpeakers: [cui, kuma],
    messageSpeakers: { 1: cui, 2: kuma, 4: cui, 5: kuma, 6: cui, 7: kuma },
    motifs: [
      {
        from: "剛跟 crush 間接接吻",
        to: "你跟古希臘那種分別對應人類靈性的神做愛去吧",
        fromSpeaker: "脆",
        toSpeaker: "熊",
        label: "間接的接吻升格為與神交合",
        side: "right",
        dotted: true, // Erotic escalation connects two different subjects, rather than a quoted reply.
      },
      {
        from: "garamond typeface 小史",
        to: "每張圖片點開看一分鐘感覺唧唧漲漲的",
        toSpeaker: "脆",
        label: "字體史成為慾望的對象",
        side: "left",
      },
    ],
  },
  "17": {
    keyword: { zh: "敏感字面化", en: "Literal Sensitivity" },
    unknownSpeakers: [kuma, cui],
    // The five original lines form a dialogue, rather than a single external
    // quotation. The bodily discovery belongs to Cui; Kuma asks and teases.
    messageSpeakers: { 1: kuma, 2: cui, 3: kuma, 4: cui, 5: kuma },
    motifs: [
      {
        from: "把理式直接字面化",
        to: "現在意識到不想被摸=敏感",
        fromSpeaker: "熊",
        toSpeaker: "脆",
        label: "概念的字面化回到身體",
        side: "left",
        dotted: true, // A conceptual analogy across the literary critique and bodily discovery.
      },
    ],
  },
  "18": {
    keyword: { zh: "外向迫害", en: "Extrovert Persecution" },
    unknownSpeakers: [cui, kuma],
    messageSpeakers: {
      1: cui, 2: kuma, 3: cui, 4: kuma, 5: kuma, 6: cui,
      7: kuma, 8: cui, 9: kuma, 10: cui, 11: kuma, 12: cui, 13: kuma,
    },
    motifs: [
      {
        from: "o so you wanna go beyond friend? like my secret lover?",
        to: "直男曖昧",
        fromSpeaker: "脆",
        toSpeaker: "脆",
        label: "曖昧的故事被命名",
        side: "left",
      },
      {
        from: "e 人其實是一個很成功的模型",
        to: "因為廢物喜歡更完善版本的自己",
        fromSpeaker: "熊",
        toSpeaker: "脆",
        label: "成功的模型成為理想自我",
        side: "right",
      },
      {
        from: "i 人被 e 人迫害的科幻",
        to: "i 人又不都覺得自己廢",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "內向者拒絕被固定為受害者",
        side: "left",
      },
    ],
  },
  "19": {
    keyword: { zh: "夢中造詞", en: "Dream Coinage" },
    unknownSpeakers: [kuma, cui],
    // cyx is Cui: the person repeatedly dreaming of cyx must be Kuma.
    // The three dreams and both proposed theory names are consecutive Kuma
    // messages; the list formatting does not imply a change of speaker.
    messageSpeakers: {
      1: cui, 2: kuma, 3: kuma, 4: kuma, 5: kuma, 6: kuma,
      7: cui, 8: cui, 9: kuma, 10: kuma, 11: cui,
    },
    motifs: [
      {
        from: "發明了一個語用學理論叫 sinopomp",
        to: "還是 sinoplosive",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "夢中的術語變體",
        side: "left",
      },
      {
        from: "發明了一個語用學理論叫 sinopomp",
        to: "sinowomp",
        fromSpeaker: "熊",
        toSpeaker: "脆",
        label: "夢中造詞變成醒時的接龍",
        side: "right",
      },
      {
        from: "怎麼連續三天夢到 cyx",
        to: "看媚宅百合番被破門而入捂嘴嘲笑我是直男",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "被夢見的人回到夢中進行審判",
        side: "left",
      },
    ],
  },
  "20": {
    keyword: { zh: "恥感地層", en: "Strata of Shame" },
    unknownSpeakers: [kuma, cui],
    // Standalone opening quote is message 1. The Buddhist proposal is a
    // nested quote inside message 7, so it does not add a numbered message.
    messageSpeakers: {
      2: kuma, 3: cui, 4: kuma, 5: kuma, 6: kuma, 7: kuma,
      8: cui, 9: kuma, 10: cui, 11: kuma, 12: kuma, 13: cui,
      14: kuma, 15: cui, 16: kuma,
    },
    motifs: [
      {
        from: "我昨天還在想能不能地質學化老中",
        to: "老中人給這段地層留下的已經挽回不回來了",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "歷史沉積成不可挽回的地層",
        side: "left",
      },
      {
        from: "spinal catastrophism",
        to: "拉開胸骨的同時心臟也被扯成了兩半",
        fromSpeaker: "脆",
        toSpeaker: "脆",
        label: "地層的災變移入身體",
        side: "right",
        dotted: true, // Anatomical catastrophe echoes the geological image indirectly.
      },
      {
        from: "有一分恨性的真情流露",
        to: "antipussychotic",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "恨性的症狀變成藥名",
        side: "left",
        dotted: true, // The coined drug name suggests, but does not explicitly repeat, the diagnosis.
      },
    ],
  },
  "21": {
    keyword: { zh: "非線性祛魅", en: "Nonlinear Disenchantment" },
    unknownSpeakers: [cui, kuma],
    // The long nonfunctional-harmony analogy is Cui's reply to Kuma's
    // nonlinear recollection. Do not alternate Kuma's three setup messages.
    messageSpeakers: {
      1: cui, 2: cui, 3: kuma, 4: cui, 5: kuma, 6: kuma,
      7: kuma, 8: kuma, 9: kuma, 10: cui, 11: kuma, 12: cui,
      13: kuma, 14: cui, 15: kuma, 16: cui, 17: kuma, 18: cui,
      19: kuma, 20: cui, 21: kuma, 22: cui, 23: kuma, 24: cui,
      25: kuma, 26: cui, 27: kuma, 28: cui, 29: kuma, 30: cui,
      31: cui,
    },
    motifs: [
      {
        from: "I go crazy for objectivity",
        to: "然後我跟 Rowan Dorin 說了你 dating app 刷到 objectivity",
        fromSpeaker: "脆",
        toSpeaker: "熊",
        label: "約會資料進入學術對話",
        side: "right",
      },
      {
        from: "我的腦非線性到所有事發生",
        to: "你的腦非線性到世界為了你讓這個瞬間散落在一年之內的三個碎片",
        fromSpeaker: "熊",
        toSpeaker: "脆",
        label: "非線性的自述被重新編排",
        side: "left",
      },
      {
        from: "lobotomized 之美",
        to: "所以 lobotomized. 所以就挺萌的吧",
        fromSpeaker: "脆",
        toSpeaker: "脆",
        label: "腦葉切除的診斷變成審美",
        side: "right",
      },
      {
        from: "本群某時刻奶子狂噴互搏",
        to: "怎麼回事 被我們四維工程了",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "群聊的非線性成為四維工程",
        side: "left",
        dotted: true, // Two distant images of the group's nonlinear causal power.
      },
    ],
  },
  "22": {
    keyword: { zh: "醜物描邊", en: "Outlined by the Ugly" },
    speakerAliases: namedSpeakers,
    unknownSpeakers: [cui, kuma],
    // Preserve the explicitly named third participant rather than forcing
    // this archival exception into an invented two-person exchange.
    motifs: [],
  },
  "23-0": {
    keyword: { zh: "終局先行", en: "The End Comes First" },
    speakerAliases: namedSpeakers,
    unknownSpeakers: [cui, kuma],
    motifs: [],
  },
};
