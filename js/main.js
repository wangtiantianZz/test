const diaries = [
    {
        id: 1,
        date: '2026-04-10',
        title: '我的好大儿——胖虎',
        cover: 'images/spring-01.jpg',
        summary: '银渐层小猫咪胖虎，毛茸茸的小家伙，是我生活中最温暖的陪伴...',
        content: [
            { type: 'text', value: '我家有只小猫咪，名叫胖虎。别看它名字威风，其实是个粘人的小毛球。银白色的毛发在阳光下闪闪发亮，圆圆的眼睛像两颗宝石，每次看向它都觉得心都要化了。' },
            { type: 'image', value: 'images/spring-01.jpg' },
            { type: 'text', value: '胖虎最喜欢的事情就是窝在我腿上睡觉，发出咕噜咕噜的声音。它还喜欢追着逗猫棒满屋子跑，那认真的小表情常常让我忍不住笑出声。' },
            { type: 'text', value: '有人说猫咪高冷，但胖虎从不。它会在我回家时跑过来蹭我的腿，会在我难过时静静趴在身边。它不只是一只猫，更是我生活中不可或缺的家人们。' }
        ]
    },
    {
        id: 2,
        date: '2026-04-08',
        title: '金鸡湖畔的午后',
        cover: 'images/spring-02.jpg',
        summary: '阳光洒在湖面上，波光粼粼，湖畔的风温柔地吹着...',
        content: [
            { type: 'text', value: '今天去了金鸡湖边走走。湖水碧蓝碧蓝的，像一面巨大的镜子，倒映着蓝天白云。湖面上偶尔有几只水鸟掠过，荡起一圈圈涟漪。' },
            { type: 'image', value: 'images/spring-02.jpg' },
            { type: 'text', value: '岸边的人们有的在散步，有的在钓鱼，有的坐在长椅上聊天。阳光暖暖的，但不晒，舒服得让人想打盹。湖边的柳树抽出了新芽，嫩绿的枝条随风飘舞。' },
            { type: 'text', value: '我找了个安静的位置坐下，看湖水轻轻拍打着岸边，听着远处传来的欢声笑语。这样的午后，简单而美好。' }
        ]
    },
    {
        id: 3,
        date: '2026-04-05',
        title: '金鸡湖的现代画卷',
        cover: 'images/spring-03.jpg',
        summary: '湖的那一边，摩天大楼拔地而起，现代与自然完美交融...',
        content: [
            { type: 'text', value: '换个角度看向金鸡湖，又是另一番景象。湖的对面，一座座摩天大楼直插云霄，玻璃幕墙在阳光下闪闪发光，现代都市的气息扑面而来。' },
            { type: 'image', value: 'images/spring-03.jpg' },
            { type: 'text', value: '湖面像一条丝带，将自然与城市串联在一起。远处的东方之门静静矗立，像一弯巨大的拱门，成了这座城市最独特的标志。' },
            { type: 'text', value: '我举起手机拍下这幅画面，心里感叹：这座城市真美，既有湖光山色的温柔，又有高楼林立的气魄。生活在这样一座城市，是一件幸福的事。' }
        ]
    }
];

function getDiaryById(id) {
    return diaries.find(diary => diary.id === parseInt(id));
}

function getAllDiaries() {
    return diaries;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options);
}
