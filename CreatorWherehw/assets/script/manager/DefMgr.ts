export enum eLayer {
    LAYER_BLOCK = 1200, // 最高，仅供加载阻挡使用

    LAYER_NOTICE = 1000, // tips toast
    LAYER_POP = 800,  // 挡在顶部栏上，又不能压住其他提示
    LAYER_GUIDE = 700,  // 新手引导
    LAYER_TOPUI = 500,  // 顶部状态栏
    LAYER_NORMAL = 400,  // 通用位置
    LAYER_BOTTOM = 100,//开始界面
}

export enum eNotifyEvent {
    PlayMusic, // 播放音乐
    StopMusic, // 停止音乐
    PlayEffect, // 播放音效

    ThingChange,
    RichChange,

    AniPlay,
    SoundEffect,
    MoveOrder,
    Sign,
    Active,
    ChangeActor,
    PickUpUI,
    BeInvited,
    DealResponse,
    MateIsReadied,
    Response,
    GetUser,
    succ,
    ReceiveChip,
    OprateChip,
    ConnectState,
    reConnect,
    Move,
    heartLeft,
    heartRight,
    Praise,
    Reseted,
    CreateActor,
}

export enum eGender {
    Male = 0,
    Female = 1,
    Other = 2,
}

export enum eRole {
    Orion = 1,//默认对应男性，黑夜
    Merope = 2//默认对应女性，白天
}

export enum eGameState {    // 游戏状态
    Main = 1,
    Prepare = 2,
    Gaming = 3,
    Message = 4,
    Register = 5,
    Login = 6,
}

export enum eNetState{
    Normal = 0,
    Prepare = 1,
    Gaming = 2
}

export enum eProc {
    //底层协议
    login = 1001,

    logout = 1002,

    reconn = 1004,//自己重连
    register = 1005,
    reset = 1006,
    offline = 1007,//对方掉线
    reback = 1008,//对方重连
    reseted = 1009,
    finish = 1010,
    onekeyreg = 1011,
    //用户协议
    ready = 2001,
    match = 2002,
    move = 2003,
    fixhole = 2004,
    killmonster = 2005,
    succ = 2006,
    fire = 2007,
    markmap = 2008,
    giveup = 2009,
    refuse = 2010,
    exit = 2011,
    operate = 2012,
    hurt = 2013,
    crtwave = 2014,
    firering = 2015,
    initmap = 2016,
    pickchip = 2017,
    door = 2018,
    godweapon = 2019,
    skill = 2020,
    sacrifice = 2021,
    stresDoor = 2022,

    //匹配协议
    invite = 3001,
    invited = 3002,
    response = 3003,
    responsed = 3004,
    binding = 3005,
    select = 3006,
    userinfo = 3007,
    ready2 = 3008,
    readied = 3009,
    unready = 3010,
    unreadied = 3011,
    selected = 3012,

    //外围协议
    board = 4001,
    boarded = 4002,
    myboard = 4003,
    boardlist = 4005,
    boardlike = 4007,

    givechip = 4009,
    givechiped = 4010,
    drawchip = 4011,
    delchip = 4013,
    compose = 4015,
    achieve = 4017,
}

export enum eThingType {
    chip = 2,
    equip = 3,
}

enum eAttrType {
    curHp = 1,//当前生命值
    maxHp = 2,//最大生命值
    curAtk = 3,//
    maxAtk = 4,//
    curDef = 5,//
    maxDef = 6,//
    curSpd = 7,//
    maxSpd = 8,//
}

enum eCompType {
    attr = "AttrComponent",
    move = "MoveComponent",
    target = "TargetComponent",
    bullet = "BulletComponent",
    skill = "SkillComponent",
    buff = "BuffComponent",
}

enum eSkillType {
    blow = "BlowSkill",
    shoot = "ShootSkill",
    slash = "SlashSkill",
}

enum eBuffType {
    blow = "BlowBuff",
    shoot = "ShootBuff",
    slash = "SlashBuff",
}

export enum eTimeConst {
    ActTime = 0.25,//动效时间
    BtnDur = 0.5,//按钮点击后禁用一段时间
}

export class Def {
    static DEFAULT_FLUSH_STEP = 10 * 1000;//数据存储间隔

    static ERROR_TOKEN_EXPIRED = 100000;   // 重复登录导致 token 过期

    static SHADER_EXPIRED = 3;//切换场景遮罩的时间如果超过该值遮罩自动隐藏
    static SHADER_LIMIT = 1;//切换场景遮罩的时间至少需要


    // CONFIG FOR DEBUG 
    //-- 0 - disable debug info; 1 - less debug info; 2 - verbose debug info
    static DEBUG = false;
    // -- display FPS stats on screen
    static DEBUG_FPS = false;
    static DEBUG_MEM = false;

    static FRAME_RATE = 60; //帧率

    static RoundRefresh = 20;   // 关卡刷新时间(单位小时)
}
