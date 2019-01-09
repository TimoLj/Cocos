import { CommonMgr } from "../manager/CommonMgr";

export class Audio{
	private static _audioClips: object = {};

	public static playMusic(url: string, loop: boolean, volumn: number){
		var clip = this._audioClips[url];
		if(clip) {
			cc.audioEngine.playMusic(clip, loop);
			cc.audioEngine.setMusicVolume(volumn);
		}else {
			CommonMgr.loadRes(url, cc.AudioClip, (err, res) => {
				if(err || !res){
					// cc.log(err, res)
					return;
				}
				this._audioClips[url] = res;
				cc.audioEngine.playMusic(res, loop);
				cc.audioEngine.setMusicVolume(volumn);
			});
		}
	}

	public static stopMusic(){
		cc.audioEngine.stopMusic();
	}

	public static setMusicVolume(volumn: number){
		cc.audioEngine.setMusicVolume(volumn);
	}

	public static setEffectsVolume(volumn: number){
		var music = cc.audioEngine.getMusicVolume();
		cc.audioEngine.setEffectsVolume(volumn);
		cc.audioEngine.setMusicVolume(music);
	}

	public static playEffect(url: string, loop: boolean, volumn: number){
		var music = cc.audioEngine.getMusicVolume();
		var clip = this._audioClips[url];
		if (clip) {
			cc.audioEngine.playEffect(clip, loop);
			cc.audioEngine.setEffectsVolume(volumn);
			cc.audioEngine.setMusicVolume(music);
		}else {
			CommonMgr.loadRes(url, cc.AudioClip, (err, res) => {
				if(err || !res){
					// cc.log(err, res)
					return;
				}
				this._audioClips[url] = res;
				cc.audioEngine.playEffect(res, loop);
				cc.audioEngine.setEffectsVolume(volumn);
				cc.audioEngine.setMusicVolume(music);
			});
		}
	}
}