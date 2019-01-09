export class Cache {
	//cache key
	public static CK_UUID = "CK_UUID_WHEREHW";//用于保存客户端唯一id，用于多服务器部署情况下，客户端能稳定进入同一个服务器
	public static CK_USERNAME = "CK_USERNAME_WHEREHW";
	public static CK_PASSWORD = "CK_PASSWORD_WHEREHW";

	public static CK_NICKNAME = "CK_NICKNAME_WHEREHW";
	public static CK_AUDIO_MUSIC = "CK_AUDIO_MUSIC_WHEREHW";
	public static CK_AUDIO_EFFECT = "CK_AUDIO_EFFECT_WHEREHW";
	public static CK_CORE = "CK_CORE_WHEREHW";

	public static CK_FIRSTENTER = "CK_FIRSTENTER_WHEREHW";
	//public static CK_CONFIRMED = "CK_CONFIRMED_WHEREHW";//是否确认过角色，1是0否，当自己是被动方是才需要此数据

	public static get(key: string, def?) {
		var value = cc.sys.localStorage.getItem(key);
		return value === null ? def : value;
	}

	public static set(key: string, val) {
		//cc.log("set??", key, val);
		cc.sys.localStorage.setItem(key, val);
	}

	public static remove(key: string) {
		cc.sys.localStorage.removeItem(key);
	}
}