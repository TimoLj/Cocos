const BATTLE_FRAME = 60

enum eComponent {
    AttriComponent  = "AttriComponent",
    MoveComponent   = "MoveComponent",
    BuffComponent   = "BuffComponent",
    AIComponent     = "AIComponent",
    SkillComponent  = "SkillComponent", 
}

enum eAttri {
    hp      = 1001,
    hpMax   = 1002,
    moveSpd = 1003,
    attack  = 1004,
    defen   = 1005,

}

enum eUnitType {
    mNull   = 0,
    mActor  = 1,
    mBullet = 2,
}

enum eUnitGroup {
    mNull        = 0,
    mAlly        = 1,
    mEnemy       = 2,
    mAllyBullet  = 3,
    mEnemyBullet = 4,
}

enum eTargetType {
    mEnemy  = 0,
    mAlly   = 1,
    mSelf   = 2,
    CurTarget = 3,
}

enum eActionState {
    mIdle      = 0,
    mPreAttack = 1,
    mAttack    = 2,
    mMove      = 3,
    mDead       = 4,
}

enum eActorState {
    mNormal   = 0,      
    mStun     = 1,      // 眩晕

}

enum eSkillTrigger {
    mCreated        = 1,    // 创建后
    mActive         = 2,    // 主动技能(只有主动技能才能出发攻击动作)
    mInAttack       = 3,    // 攻击时(伴随攻击触发的技能，在前摇之后)
    mAfterAttack    = 4,    // 造成普通伤害后
    mCrit           = 5,    // 造成暴击伤害时
    mCollider       = 6,    // 碰撞后
    mBeforeHarm     = 7,    // 受到伤害之前
    mAfterHarm      = 8,    // 受到伤害之后
    mBeforeDie      = 9,    // 死亡前
    mAfterKill      = 10,   // 击杀后
    mEveryTime      = 11,   // 在场时 (每帧)
}

enum eRank {
    mNormal      = 1,    // 普通
    mElit        = 2,    // 精英
    mBoss        = 3,    // boss
}

enum eAttackType {
    mNone       = 1,    // 没有攻击方式
    mClose      = 2,    // 近战
    mLong       = 3,    // 远程
}

enum eMoveType {
    mLine    = 1,    // 直线运动
}

enum eSortType {
    mNormal     = 0,
    mLifeUp     = 1,    // 血量递增
    mLifeDown   = 2,    // 血量递减
    mMenaceUp   = 3,    // 威胁递增
    mMenaceDown = 4,    // 威胁递减
    mDisUp      = 5,    // 距离递增
    mDisDown    = 6,    // 距离递减
    mLifePerUp  = 7,    // 血量百分比递增
    mLifePerDown= 8,    // 血量百分比递减
}

export { BATTLE_FRAME, eAttri, eComponent, eUnitType, eUnitGroup, eActionState, eActorState, eSkillTrigger, eRank, eAttackType, eMoveType, eTargetType, eSortType }