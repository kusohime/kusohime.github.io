import type { DialogueProfile } from './dialogueTypes';

const cui = { name: '脆', self: true };
const kuma = { name: '熊', self: false };
const cuiFirst = [cui, kuma];
const kumaFirst = [kuma, cui];

// These exceptions retain consecutive turns by one person. Indices refer to
// rendered messages; ellipsis dividers and empty speaker labels do not count.
const voicesFrom = (first: number, voices: string) =>
  Object.fromEntries(voices.replace(/\s/g, '').split('').map((voice, index) =>
    [first + index, voice === 'C' ? cui : kuma],
  ));

export const dialogueEarly: Record<string, DialogueProfile> = {
  '0': {
    keyword: { zh: '自封史詩', en: 'Self-Canonisation' },
    speakerAliases: { 脆: cui, 熊: kuma },
    unknownSpeakers: cuiFirst,
    replies: [
      {
        from: '它的敘事模式是捧哏與逗哏',
        to: '感覺有點像現代主義荒誕劇場',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'left',
      },
    ],
    motifs: [
      {
        from: '一千年後被當荷馬研究',
        to: '悲劇χορός內部話語',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '從史詩到合唱隊',
        dotted: true, // 同屬古典媒介的聯想，並非「荷馬」的直接復現。
      },
      {
        from: '現代主義荒誕劇場',
        to: 'Antonin Artaud x Ben Whishaw',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '劇場的具名回聲',
      },
      {
        from: 'variantology 裝置藝術',
        to: '每個對話的 motif 是有限的',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'right',
        label: '變體的呈現',
      },
      {
        from: '空無的記憶',
        to: '先兆若被後直覺',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '先兆與重現',
      },
    ],
  },
  '1': {
    keyword: { zh: '殉愛', en: "Love's Martyrology" },
    unknownSpeakers: cuiFirst,
    motifs: [
      {
        from: '想像一種死亡學', to: '感覺本質末日學',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '死亡學的末日歸宿',
      },
      {
        from: 'Martyrology of 永愛',
        to: '與你相戀到生命盡頭的蘇生魔法',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '殉教與復生的永愛',
      },
      {
        from: 'Ian Curtis. . . Evald Ilyenkov',
        to: '看到最後一行的ian curtis皺起眉頭',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '死者返回讀者席',
      },
    ],
  },
  '2': {
    keyword: { zh: '平庸共犯', en: 'Complicit Mediocrity' },
    unknownSpeakers: kumaFirst,
    motifs: [
      {
        from: '初中作文水平', to: 'remorse',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '自貶成為才子病',
      },
      {
        from: '最後都會converge into一種coeternal antinomy',
        to: 'coeternal antinomy聽起來像一種官設對家cp',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '二律背反成為配對',
      },
      {
        from: 'fandom中的esotericity', to: '所有小心思都藏在尾骨蓄勢待發',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '秘傳與小心思',
      },
    ],
  },
  '3': {
    keyword: { zh: '關係主權', en: 'Relational Sovereignty' },
    unknownSpeakers: cuiFirst,
    messageSpeakers: voicesFrom(6, 'CB CBCB CBCB CB'),
    motifs: [
      {
        from: '不要丟下我一個人', to: '那誰沒有分離障礙',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '分離的反證',
      },
      {
        from: '某種東西eternalize了', to: '百年好合原來是百合eternalized',
        fromSpeaker: '熊', toSpeaker: '熊', side: 'left',
        label: '永恆的再命名',
      },
      {
        from: '我想掌握所有人的關係線加以leverage', to: '你哪來的agency',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '關係控制與行動權',
      },
    ],
  },
  '4': {
    keyword: { zh: '邪典家教', en: 'Cult Upbringing' },
    unknownSpeakers: cuiFirst,
    messageSpeakers: { 8: cui, 9: kuma, 10: cui, 11: kuma },
    motifs: [
      {
        from: '看國美書單長大', to: '我是看藥娘吧長大的',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '文化教養的地下版本',
      },
      {
        from: '我是看藥娘吧長大的', to: '我是看肩上的腳丫吧長大的',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '長大句式的競逐',
      },
    ],
  },
  '5': {
    keyword: { zh: '異國藏品', en: 'Exotic Inventory' },
    unknownSpeakers: cuiFirst,
    motifs: [
      {
        from: '舊書店裡的occult shelf', to: '我的書會進什麼shelf',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '書架上的自我定位',
      },
      {
        from: '你的書會進什麼shelf', to: "artifactise進China's Hidden Century",
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '書架成為博物館',
      },
    ],
  },
  '6': {
    keyword: { zh: '詞源滑移', en: 'Etymological Slippage' },
    unknownSpeakers: cuiFirst,
    motifs: [
      {
        from: 'agon', to: '阿滾',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '希臘詞的諧音轉寫',
      },
      {
        from: '阿滾', to: '原來滾是女神',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '諧音生成神話',
      },
    ],
  },
  '7': {
    keyword: { zh: '學術排泄', en: 'Academic Excretion' },
    unknownSpeakers: cuiFirst,
    messageSpeakers: { 2: cui, 3: kuma, 13: kuma, 14: cui, 15: kuma, 16: cui },
    motifs: [
      {
        from: 'authoritatively endorsed but never approved for thesis',
        to: '毫無悔意BS詮釋avec註定正典化心態',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '學術授權與正典慾望',
        dotted: true, // 評分授權與正典化是相鄰批評，沒有明示彼此等同。
      },
      {
        from: '大部分學生讀不懂本專業的文本', to: '無徵引能力天才',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '閱讀能力與天才人設',
        dotted: true, // 從文本能力到天才人設的概念對照。
      },
      {
        from: '神經科學的真的都去從商了', to: '最投機主義的科學學科',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '學科的商業歸宿',
      },
    ],
  },
  '8': {
    keyword: { zh: '慾望矩陣', en: 'Desire Matrix' },
    unknownSpeakers: cuiFirst,
    messageSpeakers: voicesFrom(14, 'CB CB CB CB CB CB CB CB CB CB'),
    motifs: [
      {
        from: '房間裡一股味淋味', to: '嬸嬸味也變成八角桂皮',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '室內氣味轉為身體氣味',
        dotted: true, // 相隔話題的氣味意象回聲。
      },
      {
        from: '這完全是關係矩陣問題', to: '不要philosophise信息素設定',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '慾望的分類與哲學化',
        dotted: true, // 關係矩陣與信息素設定是兩個場景的間接呼應。
      },
      {
        from: '以八角桂皮為ontogenesis', to: '明明是organismal-biologise',
        fromSpeaker: '熊', toSpeaker: '熊', side: 'left',
        label: '哲學設定的生物學辯護',
      },
    ],
  },
  '9': {
    keyword: { zh: '腦控美學', en: 'Mind-Control Aesthetics' },
    unknownSpeakers: kumaFirst,
    messageSpeakers: { 4: kuma, 5: cui },
    motifs: [
      {
        from: '反對方法論和精神的封閉',
        to: '長久的控制和恐懼才是所學之用',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '開放宣言的反面',
      },
      {
        from: '你們都是我腦控的子民',
        to: '開啟腦控暗道轉向邪惡科學技術範式',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '腦控成為技術範式',
      },
      {
        from: '高強度エゴサーチャー', to: '文化人又在把自己元物理城居依生齧齒動物化',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '自我展示與城市寄生',
        dotted: true, // 連接自我搜索和城居動物意象，未復述同一命題。
      },
    ],
  },
  '10': {
    keyword: { zh: '古典宅性', en: 'Classical Fandom' },
    unknownSpeakers: cuiFirst,
    motifs: [
      {
        from: '古典學本質 nostalgic pop culture',
        to: '古希臘文化本質 retro sci-fi diy autoparaphilic soap drama',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '古典與流行文化互譯',
      },
      {
        from: '瘋狂取典 ACG', to: 'はらだ画展',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '援引轉為當下實踐',
        dotted: true, // ACG 援引與畫展的實踐關係由語境推得。
      },
    ],
  },
  '11': {
    keyword: { zh: '語言神術', en: 'Linguistic Theurgy' },
    unknownSpeakers: cuiFirst,
    motifs: [
      {
        from: 'universal grammar 是錯的但還是覺得很美',
        to: 'glimmering 圖景 of 人類心靈',
        fromSpeaker: '脆', toSpeaker: '脆', side: 'right',
        label: '被證偽的心靈美學',
      },
      {
        from: '巴別塔最後的子嗣', to: '受詛遺忘但再逢仍緣',
        fromSpeaker: '脆', toSpeaker: '熊', side: 'right',
        label: '語言失落與再逢',
        dotted: true, // 巴別塔與受詛遺忘是跨神話的聯想。
      },
      {
        from: '言靈與魔咒', to: 'Echolalias',
        fromSpeaker: '熊', toSpeaker: '脆', side: 'left',
        label: '魔咒返回回聲言語',
        dotted: true, // 言靈與回聲言語之間是概念回響，沒有明確引用。
      },
    ],
  },
};
