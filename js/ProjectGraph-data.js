var nodes = new vis.DataSet([
{ id:0, labelEN: "ROOT", color: "cyan", },
{ id:1, labelEN: "business plan", labelZH: "商业计划书", },
{ id:2, labelEN: "technical white paper", labelZH: "技术白皮书", },
{ id:3, labelEN: "web site", labelZH: "网站", },
{ id:4, labelEN: "Git UI", labelZH: "Git 界面", },
{ id:5, labelEN: "Project Graph" },
{ id:6, labelEN: "chatroom interface", labelZH: "聊天室 界面", },
{ id:7, labelEN: "DAO interface", labelZH: "DAO 界面", },
{ id:8, labelEN: "Discord" },
{ id:9, labelEN: "bot scripts", },
{ id:10, labelEN: "extract WeChat logs", labelZH: "extract 微信 chat logs", },
{ id:11, labelEN: "connect Aragon", },
{ id:12, labelEN: "voting UI", color: "#f77", },
{ id:13, labelEN: "bug: total votes >100", color: "#f77", details: `Solved by continuous slider`, },
{ id:14, labelEN: "tell 'Crossing the Snow' story", labelZH: "讲《渡过雪原》故事", },
{ id:15, labelEN: "read Git repo", },
{ id:16, labelEN: "extract authors", },
{ id:17, labelEN: "Neo4j", color: "#999", },
{ id:18, labelEN: "VisDCC interface", labelZH: "VisDCC 界面", details: `基本上已经可以使用了。

各人可以储存自己的 json 档案，自行试验一下。 

这部分有个 to-do 工作未完成： 查看成员的贡献值。 所以我开了一个 sub-task 在它的子叶。`, },
{ id:19, labelEN: "lookup authors", labelZH: "查看作者", },
{ id:20, labelEN: "create Aragon DAO", color: "#f77", details: `@YKY: @Alvin helped me to create an initial DAO blockchain on Aragon, with 1 million tokens.`, },
{ id:21, labelEN: "test Neo4j server", color: "#f77", details: `@eatcosmos tested hosting the server.`, },
{ id:22, labelEN: "hello world", color: "#f77", },
{ id:23, labelEN: "transfer messages to WeChat", labelZH: "转发讯息到微信", },
{ id:24, labelEN: "WeChat Enterprise version", labelZH: "企业微信", },
{ id:25, labelEN: "send messages to Discord", labelZH: "转发讯息到 Discord", },
{ id:26, labelEN: "per-Task voting", labelZH: "per task 投票", },
{ id:27, labelEN: "send tokens", labelZH: "发 token", },
]);
var edges = new vis.DataSet([
{ from:1, to: 0 },
{ from:2, to: 0 },
{ from:3, to: 0 },
{ from:4, to: 0 },
{ from:5, to: 0 },
{ from:6, to: 0 },
{ from:7, to: 0 },
{ from:8, to: 6 },
{ from:6, to: 3 },
{ from:9, to: 8 },
{ from:11, to: 7 },
{ from:12, to: 7 },
{ from:13, to: 12 },
{ from:14, to: 1 },
{ from:15, to: 4 },
{ from:16, to: 15 },
{ from:17, to: 5 },
{ from:18, to: 5 },
{ from:19, to: 18 },
{ from:12, to: 18 },
{ from:16, to: 19 },
{ from:20, to: 11 },
{ from:21, to: 18 },
{ from:22, to: 9 },
{ from:23, to: 9 },
{ from:24, to: 6 },
{ from:10, to: 24 },
{ from:25, to: 24 },
{ from:26, to: 18 },
{ from:27, to: 11 },
{ from:27, to: 26 },
]);
