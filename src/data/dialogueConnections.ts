type DialogueMotif = {
  from: string;
  to: string;
  fromSpeaker?: string;
  toSpeaker?: string;
  label: string;
  side?: "left" | "right";
  dotted?: boolean;
};

export const dialogueConnectionCases: Record<string, { motifs: DialogueMotif[] }> = {
  "23-0": {
    motifs: [
      {
        from: "这个群以外没有这个 router 性质",
        to: "通过以太坊传播💉疫瞄迷因饭沼10492",
        fromSpeaker: "脆",
        toSpeaker: "贺",
        label: "群体传导",
        side: "right",
      },
      {
        from: "人类一定要发明自己的语言呀",
        to: "人类一定要发明自己的语言呀",
        fromSpeaker: "贺",
        toSpeaker: "脆",
        label: "三声部同词",
        side: "left",
      },
      {
        from: "什么 quirk 都可以 reduce 到 adhd induced",
        to: "怎么 neuro epi 好像是真的",
        fromSpeaker: "脆",
        toSpeaker: "脆",
        label: "症状的模型",
        side: "right",
        dotted: true, // ADHD 归因与后文情感传染并非同一模型的明示回用。
      },
      {
        from: "结局早已经发生",
        to: "终其一生去 approach 这个已经发生的结局的形象",
        fromSpeaker: "脆",
        toSpeaker: "脆",
        label: "预先发生的终局",
        side: "left",
      },
      {
        from: "世界进入大 poly 时代。就是完全原教旨马克思",
        to: "后现代反转马克思就是一种 poly 文化",
        fromSpeaker: "脆",
        toSpeaker: "熊",
        label: "poly／马克思",
        side: "right",
      },
      {
        from: "德国人有 bisexual 民族性",
        to: "拉美化底色也是 bisexuality",
        fromSpeaker: "熊",
        toSpeaker: "脆",
        label: "民族性的迁移",
        side: "left",
      },
      {
        from: "it all comes down to 男孩只想玩儿",
        to: "大象就是男孩儿只想玩精神的实体化",
        fromSpeaker: "贺",
        toSpeaker: "贺",
        label: "玩乐的实体",
        side: "left",
      },
      {
        from: "有的时候我只是一个男孩在这个世界上",
        to: "it all comes down to 男孩只想玩儿",
        fromSpeaker: "贺",
        toSpeaker: "贺",
        label: "男孩的自我认识",
        side: "left",
        dotted: true, // 自我定位与玩乐欲望共享「男孩」意象，而非直接答复。
      },
      {
        from: "我觉得 24 岁关键词还是 adulting 和 bildungsroman",
        to: "我感觉这个就是 adulting 为什么完全知道你在说什么",
        fromSpeaker: "贺",
        toSpeaker: "贺",
        label: "成长的自我认出",
        side: "left",
      },
      {
        from: "所以都是为了 eschaton 后的 eschaton",
        to: "已经完成性解放 posteschatological 了",
        fromSpeaker: "熊",
        toSpeaker: "脆",
        label: "末世之后",
        side: "right",
      },
      {
        from: "然后通过灵视接受电波传输的通感信号",
        to: "第三眼灵视发力了",
        fromSpeaker: "脆",
        toSpeaker: "脆",
        label: "灵视的再现",
        side: "right",
      },
      {
        from: "三分之二的晚上都会梦到 upenn 男",
        to: "有时候看着一个人说话会想是我是在我的梦里还是你的梦里",
        fromSpeaker: "贺",
        toSpeaker: "熊",
        label: "梦的主体交换",
        side: "left",
        dotted: true, // 两个梦境段落没有明确互引，联系在主体转换。
      },
    ],
  },
  "ben-qun-9": {
    motifs: [
      {
        from: "跟智能無關的男性氣質",
        to: "智能和性能獨立運作",
        fromSpeaker: "脆",
        toSpeaker: "熊",
        label: "智能／性能分离",
        side: "right",
      },
      {
        from: "所以是寶寶是 transcelestial",
        to: "有種 transcelestiality 原詞",
        toSpeaker: "熊",
        label: "孩童／超天界",
        side: "right",
      },
      {
        from: "narrowing down 比文 to quotational studies",
        to: "《孤獨》 白鶴林",
        fromSpeaker: "贺",
        toSpeaker: "贺",
        label: "引文成为内容",
        side: "left",
        dotted: true, // 研究方法与后续引诗是间接的形式呼应。
      },
    ],
  },
  "22": {
    motifs: [
      {
        from: "他好爱你",
        to: "你好爱他",
        fromSpeaker: "熊",
        toSpeaker: "熊",
        label: "你与他的倒影",
        side: "left",
      },
      {
        from: "为什么感觉本群 on 咖啡因",
        to: "为什么感觉本群 on 咖啡因",
        fromSpeaker: "贺",
        toSpeaker: "熊",
        label: "三声部同词",
        side: "right",
      },
    ],
  },
};
