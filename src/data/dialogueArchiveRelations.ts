export interface DialogueArchiveRelation {
  /** The responding/later chapter and the chapter to which it looks back. */
  from: string;
  to: string;
  kind: "reply" | "echo";
  /** Dotted slurs distinguish an indirect/interpretive reading from recurrence. */
  dotted?: boolean;
  label: { zh: string; en: string };
  evidence: { from: string; to: string };
}

/**
 * Cross-chapter readings of the complete dialogue archive. A reply requires
 * an explicit chapter reference or a quoted turn recoverable in that chapter;
 * an echo records a particular formulation or argument, not a shared tag.
 * `from`/`to` use chapter frontmatter slugs, not file names or series numbers.
 */
export const dialogueArchiveRelations: DialogueArchiveRelation[] = [
  {
    from: "23-0", to: "22", kind: "reply",
    label: { zh: "「像他爹」的回覆", en: "The father comparison, answered" },
    evidence: {
      from: "（> 但他就是生气然后说我像他爹）感觉这一刻我意识到 cyx 是男的",
      to: "但他就是生气然后说我像他爹因为抓住一个东西不放。",
    },
  },
  {
    from: "21", to: "1", kind: "reply",
    label: { zh: "重讀第一篇", en: "Rereading Dialogue 1" },
    evidence: {
      from: "這個過程=芙莉蓮=柏拉圖全集 怎麼順便把 #脆熊篇 001 收集了",
      to: "或葬送的芙莉蓮. . .魔法壞女巫. . .Diogenes Lærtius的四部曲排序柏拉圖全集",
    },
  },
  {
    from: "ben-qun-9", to: "ben-qun-8b", kind: "reply",
    label: { zh: "四種故事的終局", en: "Four stories in one ending" },
    evidence: {
      from: "#本群篇 8 || 坍縮了這四種故事 in 1 個終局",
      to: "以及人成為神和神成為人的故事。本群發生了全部四種故事",
    },
  },
  {
    from: "13", to: "2", kind: "echo",
    label: { zh: "永恆二律背反", en: "Coeternal antinomy" },
    evidence: {
      from: "coeternal antinomy",
      to: "想死for different reasons但最後都會converge into一種coeternal antinomy",
    },
  },
  {
    from: "14", to: "1", kind: "echo", dotted: true,
    label: { zh: "以生命換取幸福", en: "Life exchanged for another's happiness" },
    evidence: {
      from: "如果真的有壽命轉福祉的魔法我會用在你身上因為想看到你絕對幸福的樣子",
      to: "只為你能回到你的order of reality的Khaled Hosseini/Marion Wheeler級情節去死之美",
    },
  },
  {
    from: "ben-qun-3", to: "3", kind: "echo", dotted: true,
    label: { zh: "分離與永久連接", en: "Separation and the permanent bond" },
    evidence: {
      from: "恨是 l'aide-mémoire perpétuelle, rétentivité récursive de la volonté alternative de vivre 另類分離焦慮 / 家族牽掛",
      to: "不要丟下我一個人",
    },
  },
  {
    from: "ben-qun-7", to: "ben-qun-3", kind: "echo", dotted: true,
    label: { zh: "愛恨／祝咒", en: "Love–hate, blessing–curse" },
    evidence: {
      from: "但我依然祝福你，并且诅咒你。",
      to: "相互永久詛咒的關係 10/26/23",
    },
  },
  {
    from: "ben-qun-9", to: "ben-qun-3", kind: "echo",
    label: { zh: "暴烈連接的歸宿", en: "The end of the violent bond" },
    evidence: {
      from: "實在界我來了=摧枯拉朽爆操一頓 然後共腦 passage to the act=殉情",
      to: "和別人只能建立摧枯拉朽狂操一頓（但退房之前沒有人比我更愛你）的關係 xor 這輩子不見面但通過某種超越連接相互永久詛咒的關係 10/26/23",
    },
  },
  {
    from: "ben-qun-2", to: "11", kind: "echo", dotted: true,
    label: { zh: "語言作為咒語", en: "Language as incantation" },
    evidence: {
      from: "伴珠默唸四萬三千遍神啟萬物死",
      to: "言靈與魔咒",
    },
  },
  {
    from: "ben-qun-8b", to: "21", kind: "echo",
    label: { zh: "四維工程的重現", en: "Four-dimensional engineering, repeated" },
    evidence: {
      from: "怎麼回事 被我們四維工程了",
      to: "怎麼回事 被我們四維工程了",
    },
  },
  {
    from: "23-0", to: "21", kind: "echo", dotted: true,
    label: { zh: "已在過去完成的終點", en: "An ending already in the past" },
    evidence: {
      from: "然后终其一生去 approach 这个已经发生的结局的形象。",
      to: "非功能和聲裡作為終點的主的解決已經在過去結束了，下屬和屬的張力作為焦慮並發展",
    },
  },
  {
    from: "ben-qun-9", to: "13", kind: "echo", dotted: true,
    label: { zh: "以引文延續談話", en: "Conversation through quotation" },
    evidence: {
      from: "narrowing down 比文 to quotational studies and taking the consequences that come with it",
      to: "我們 reciprocal quoting 式聊天完全 false cognate momo 聊天。",
    },
  },
  {
    from: "23-0", to: "ben-qun-9", kind: "echo", dotted: true,
    label: { zh: "長大與遊戲", en: "Adulting and play" },
    evidence: {
      from: "it all comes down to 男孩只想玩儿",
      to: "adulting 某種程度上是 metagaming 但寶寶遊戲是成為大人來 unbecome 大人的 gaming",
    },
  },
];
