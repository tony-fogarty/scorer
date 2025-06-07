/*
 * n01_data.js
 *
 * Copyright (C) 1996-2015 by Ohno Tomoaki. All rights reserved.
 */

/*eslint-env browser, jquery*/
/*globals n01_util */
var n01_data = (function () {
	var me = {};

	// TOPページ(戻り用)
	me.topPage = '../n01.html';
	// SUBページのパス
	me.subPagePath = 'n01_v2/';

	// 設定用接頭辞
	me.generalPrefix = '';
	me.optionPrefix = 'n01_sc.';

	// 設定
	me.options = {
		keyShow: 0,
		leftShow: 1,
		roundDarts: 1,
		circleTon: 1,
		avePPR: 1,
		smallKeypad: 0,
		inputTag: 0,
		inputLeft: 0,
		inputLeftCom: 0
	};
	me.saveOptions = function () {
		localStorage.setItem(me.generalPrefix + 'options', JSON.stringify(me.options));
	};
	me.restoreOptions = function () {
		var str = localStorage.getItem(me.generalPrefix + 'options');
		if (str !== null) {
			me.options = JSON.parse(str);
			if (me.options.roundDarts === undefined) {
				me.options.roundDarts = 1;
			}
			if (me.options.circleTon === undefined) {
				me.options.circleTon = 1;
			}
			var ua = n01_util.getUserAgent();
			if (me.options.smallKeypad === undefined && ua.isTablet) {
				me.options.smallKeypad = 1;
			}
			if (me.options.leftShow === undefined && !(ua.isWindowsPhone || ua.isiOS || ua.isAndroid)) {
				me.options.leftShow = 1;
			}
		} else {
			var ua = n01_util.getUserAgent();
			if (ua.isTablet) {
				me.options.smallKeypad = 1;
			}
			if (ua.isWindowsPhone || ua.isiOS || ua.isAndroid) {
				me.options.keyShow = 1;
				me.options.leftShow = 0;
			}
		}
	};

	// ゲーム設定
	me.gameOptions = {
		title: '',
	 	playerName: ['', ''],
		scheduleData: [],
		setData: [],
		nextSetData: null,
	 	changeFirst: 0,
	 	exitResult: 0,

		scheduleEditIndex: 0,
		currentSet: 0,
	 	winSets: [0, 0],
	};
	me.initScheduleData = {
		subTitle: '',
	 	playerName: ['', ''],
		startScore: 501,
		roundLimit: 0,
		maxRound: 15,
		limit_leg_count: 2,
	};

	me.saveGameOptions = function () {
		localStorage.setItem(me.optionPrefix + 'gameOptions', JSON.stringify(me.gameOptions));
	};
	me.restoreGameOptions = function () {
		var str = localStorage.getItem(me.optionPrefix + 'gameOptions');
		if (str !== null) {
			me.gameOptions = JSON.parse(str);
		} else {
			me.initGameOptions();
		}
	};

	me.initGameOptions = function () {
		me.gameOptions = {
			title: '',
		 	playerName: ['', ''],
			scheduleData: [],
			setData: [],
			nextSetData: null,
		 	changeFirst: 0,
		 	exitResult: 0,

			scheduleEditIndex: 0,
			currentSet: 0,
		 	winSets: [0, 0],
		};
		me.initSchedule();
		me.saveGameOptions();
	};

	me.initSchedule = function () {
		var lang = '';
		if (navigator.browserLanguage) {
		    lang = navigator.browserLanguage;
		} else if (navigator.language) {
		    lang = navigator.language;
		}
		if (lang.length > 2) {
			lang = lang.substr(0, 2);
		}
		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[0].subTitle = (lang === 'ja') ? 'ガロン' : 'Team';
		me.gameOptions.scheduleData[0].startScore = 1001;
		me.gameOptions.scheduleData[0].roundLimit = 1;
		me.gameOptions.scheduleData[0].maxRound = 30;
		me.gameOptions.scheduleData[0].limit_leg_count = 1;

		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[1].subTitle = (lang === 'ja') ? 'ダブルス1' : 'Doubles1';
		me.gameOptions.scheduleData[1].roundLimit = 1;

		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[2].subTitle = (lang === 'ja') ? 'ダブルス2' : 'Doubles2';
		me.gameOptions.scheduleData[2].roundLimit = 1;

		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[3].subTitle = (lang === 'ja') ? 'シングルス1' : 'Singles1';
		me.gameOptions.scheduleData[3].roundLimit = 1;

		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[4].subTitle = (lang === 'ja') ? 'シングルス2' : 'Singles2';
		me.gameOptions.scheduleData[4].roundLimit = 1;

		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[5].subTitle = (lang === 'ja') ? 'シングルス3' : 'Singles3';
		me.gameOptions.scheduleData[5].roundLimit = 1;

		me.gameOptions.scheduleData.push($.extend(true, {}, me.initScheduleData));
		me.gameOptions.scheduleData[6].subTitle = (lang === 'ja') ? 'シングルス4' : 'Singles4';
		me.gameOptions.scheduleData[6].roundLimit = 1;
	};

	// セットデータ
	me.setData = null;
	
	me.initLegData = {
		first: 0,
		currentRound: 0,
		currentPlayer: 0,
		selectRound: 0,
		selectPlayer: 0,
		endFlag: 0,
		middleForDiddle: 0,
		winner: 0,

		playerData: [[
			{score: 0, left: 0}
		],
		[
			{score: 0, left: 0}
		]]
	};
	me.initStatData = {
		name: '',
		winLegs: 0,
		pid: '',
		me: 0,
	};

	me.clearSet = function () {
		me.setData = null;
		me.saveSetData();
		localStorage.setItem(me.optionPrefix + 'sendScoreData', null);
	};
	me.initSet = function () {
		me.restoreGameOptions();
		var title;
		if (me.gameOptions.title !== '' && me.gameOptions.scheduleData[me.gameOptions.currentSet].subTitle !== '') {
			title = me.gameOptions.title + ' ' + me.gameOptions.scheduleData[me.gameOptions.currentSet].subTitle;
		} else {
			title = me.gameOptions.title + me.gameOptions.scheduleData[me.gameOptions.currentSet].subTitle;
		}
		
		var p1name = me.gameOptions.playerName[0];
		if (me.gameOptions.scheduleData[me.gameOptions.currentSet].playerName[0] !== '') {
			p1name = p1name + ' (' + me.gameOptions.scheduleData[me.gameOptions.currentSet].playerName[0] + ')';
		}
		var p2name = me.gameOptions.playerName[1];
		if (me.gameOptions.scheduleData[me.gameOptions.currentSet].playerName[1] !== '') {
			p2name = p2name + ' (' + me.gameOptions.scheduleData[me.gameOptions.currentSet].playerName[1] + ')';
		}
		me.setData = {
			startTime: Math.floor(new Date().getTime() / 1000),
			title: title,
			startScore: me.gameOptions.scheduleData[me.gameOptions.currentSet].startScore,
			currnetInput: '',
			currentLeg: 0,
			limitLeg: 0,
			endMatch: 0,

			legData: [],
			statsData: []
		};

		me.setData.legData.push($.extend(true, {}, n01_data.initLegData));
		me.setData.legData[me.setData.currentLeg].playerData[0][0].left = me.gameOptions.scheduleData[me.gameOptions.currentSet].startScore;
		me.setData.legData[me.setData.currentLeg].playerData[1][0].left = me.gameOptions.scheduleData[me.gameOptions.currentSet].startScore;
		
		me.setData.statsData.push($.extend(true, {}, n01_data.initStatData));
		me.setData.statsData[0].name = p1name;

		me.setData.statsData.push($.extend(true, {}, n01_data.initStatData));
		me.setData.statsData[1].name = p2name;
		
		me.saveSetData();
	};


	me.saveSetData = function () {
		localStorage.setItem(me.optionPrefix + 'setData', JSON.stringify(me.setData));
	};
	me.restoreSetData = function () {
		var str = localStorage.getItem(me.optionPrefix + 'setData');
		if (str !== null) {
			me.setData = JSON.parse(str);
		}
	};
	me.getSetData = function () {
		var str = localStorage.getItem(me.optionPrefix + 'setData');
		if (str !== null) {
			return JSON.parse(str);
		}
		return null;
	};

	return me;
})();
