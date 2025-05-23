const sentences = [
    "(ง •̀_•́)ง Code changes the world, you change the code.",
    "(●'◡'●)ﾉ Every bug is an opportunity to grow.",
    "(｡･ω･｡) Let code be poetry, let life be art.",
    "(๑•̀ㅂ•́)و✧ The journey of programming never ends.",
    "(ง •̀_•́)ง Today's code, tomorrow's product.",
    "(●'◡'●)ﾉ Let technology improve life, let innovation change the world.",
    "(｡･ω･｡) Code like poetry, live like a song.",
    "(๑•̀ㅂ•́)و✧ Make programming fun, make life surprising.",
    "(ง •̀_•́)ง Every project is a new beginning.",
    "(●'◡'●)ﾉ Let technology warm life, let code change the world.",
    "(｡･ω･｡) Programming is poetry, life is art.",
    "(๑•̀ㅂ•́)و✧ Code changes the world, innovation shapes the future.",
    "(ง •̀_•́)ง Let technology improve life, let innovation change the world.",
    "(●'◡'●)ﾉ The road of programming never ends.",
    "(｡･ω･｡) Let code be poetry, let life be art.",
    "(๑•̀ㅂ•́)و✧ Every bug is a chance to grow.",
    "(ง •̀_•́)ง Code changes the world, you change the code.",
    "(●'◡'●)ﾉ Let technology warm life, let code change the world.",
    "(｡･ω･｡) Programming is poetry, life is a song.",
    "(๑•̀ㅂ•́)و✧ Make programming fun, make life surprising.",
    "(ง •̀_•́)ง Every project is a new beginning.",
    "(●'◡'●)ﾉ Let technology improve life, let innovation change the world.",
    "(｡･ω･｡) Code like poetry, life like art.",
    "(๑•̀ㅂ•́)و✧ The journey of programming never ends.",
    "(ง •̀_•́)ง Today's code, tomorrow's product.",
    "(●'◡'●)ﾉ Let technology warm life, let code change the world.",
    "(｡･ω･｡) Programming is poetry, life is a song.",
    "(๑•̀ㅂ•́)و✧ Make programming fun, make life surprising.",
    "(ง •̀_•́)ง Every project is a new beginning.",
    "(●'◡'●)ﾉ Let technology improve life, let innovation change the world."
];

// 用于存储上次请求的时间戳
let lastRequestTime = 0;
const DEBOUNCE_TIME = 1000; // 1秒的防抖时间

exports.handler = async function(event, context) {
    const currentTime = Date.now();
    
    // 检查是否在防抖时间内
    if (currentTime - lastRequestTime < DEBOUNCE_TIME) {
        return {
            statusCode: 429, // Too Many Requests
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Retry-After': '1'
            },
            body: JSON.stringify({
                error: '请求过于频繁，请稍后再试',
                retryAfter: 1
            })
        };
    }
    
    // 更新最后请求时间
    lastRequestTime = currentTime;
    
    const randomIndex = Math.floor(Math.random() * sentences.length);
    const randomSentence = sentences[randomIndex];
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            sentence: randomSentence
        })
    };
};
