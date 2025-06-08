/*
 * n01_new.js
 *
 * Copyright (C) 1996-2017 by Ohno Tomoaki. All rights reserved.
 */

/*eslint-env browser, jquery*/
/*globals n01_data n01_util*/
var oldStartScore;
var resources = {
	en : {
	},
	ja : {
		header_title : "スケジュール編集",
		button_cancel : "キャンセル",
		button_done : "完了",

		title_match_title : "サブタイトル(任意)",
		title_player_name : "プレイヤー名(任意)",
		title_start_score : "開始スコア",
		label_limit_rounds : "ラウンド数を制限",
		limit_leg_msg1 : "",
		limit_leg_msg2 : " Leg先取",
	},
};
var res = {};
var lang = 'en';
$(document).ready(function() {
	if (navigator.browserLanguage) {
	    lang = navigator.browserLanguage;
	} else if (navigator.language) {
	    lang = navigator.language;
	}
	if (lang.length > 2) {
		lang = lang.substr(0, 2);
	}
	res = resources[lang];
	if (res === undefined) {
		res = resources['en'];
	} else if (lang !== 'en') {
		$('#header_title').text(res.header_title);
		$('#button_cancel').text(res.button_cancel);
		$('#button_done').text(res.button_done);

		$('#title_match_title').text(res.title_match_title);
		$('#title_player_name').text(res.title_player_name);
		$('#title_start_score').text(res.title_start_score);
		$('#label_limit_rounds').text(res.label_limit_rounds);
		$('#limit_leg_msg1').text(res.limit_leg_msg1);
		$('#limit_leg_msg2').text(res.limit_leg_msg2);
	}
});

$(document).ready( function() {
	$('#header').show();
	$('#article').show();
	$('#contents').show();
	initSetting();
	resize();

	$(window).resize(function() {
		resize();
	});

	$(document).on('keydown', function(e) {
		switch (e.keyCode) {
		case 13:	// Enter
			$('#button_game_on').click();
			break;
		case 27:	// ESC
			setTimeout(function() {
				$('#button_cancel').click();
			}, 100);
			break;
		}
	});

	$('#start_score').on('blur', function(){
		var startScore = $('#start_score').val();
		if (startScore === '') {
			startScore = 501;
		} else {
			startScore = parseInt(startScore, 10);
		}
		if (oldStartScore === startScore) {
			return;
		}
		oldStartScore = startScore;
		
		var rounds;
		switch (startScore) {
		case 301:
			rounds = 10;
			break;
		case 501:
			rounds = 15;
			break;
		case 1001:
			rounds = 30;
			break;
		default:
			rounds = 60;
			break;
		}
		$('#rounds').val(rounds);
	});

	$('#button_cancel').click(function() {
		if (n01_data.getSetData() !== null) {
			window.location.href = 'modify.html';
		} else {
			window.location.href = '../index.html';
		}
	});

	$('#button_done').click(function() {
		// GameOptionの保存
		n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].subTitle = jQuery.trim($('#match_title').val());
		n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].playerName[0] = jQuery.trim($('#p1_name').val());
		n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].playerName[1] = jQuery.trim($('#p2_name').val());
		var startScore = $('#start_score').val();
		if (startScore === '') {
			startScore = 501;
		} else {
			startScore = parseInt(startScore, 10);
			if (startScore <= 1) {
				startScore = 501;
			}
		}
		n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].startScore = startScore;
		
		if ($('#limit_rounds').prop('checked')) {
			n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].roundLimit = 1;
		} else {
			n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].roundLimit = 0;
		}
		var rounds = $('#rounds').val();
		if (rounds === '') {
			rounds = 15;
		} else {
			rounds = parseInt(rounds, 10);
			if (rounds < 0) {
				rounds = 15;
			}
		}
		n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].maxRound = rounds;

		var limit_leg_count = $('#limit_leg_count').val();
		if (limit_leg_count === '') {
			limit_leg_count = 2;
		} else {
			limit_leg_count = parseInt(limit_leg_count, 10);
			if (limit_leg_count <= 0) {
				limit_leg_count = 1;
			}
			if (limit_leg_count > 99) {
				limit_leg_count = 99;
			}
		}
		n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].limit_leg_count = limit_leg_count;
		n01_data.saveGameOptions();
		if (n01_data.getSetData() !== null) {
			window.location.href = 'modify.html';
		} else {
			window.location.href = '../index.html';
		}
	});
});

function connectText(textid, ischecked) {
	$('#' + textid).prop('disabled', !ischecked);
}

function initSetting() {
	// GameOptionの読み込み
	n01_data.restoreGameOptions();
	
	$('#match_title').val(n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].subTitle);

	$('#p1_name').val(n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].playerName[0]);
	$('#p2_name').val(n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].playerName[1]);

	$('#start_score').val(n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].startScore);
	oldStartScore = n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].startScore;

	$('#limit_rounds').prop('checked', (n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].roundLimit) ? true : false);
	$('#rounds').val(n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].maxRound);
	connectText('rounds', $('#limit_rounds').prop('checked'));

	$('#limit_leg_count').val(n01_data.gameOptions.scheduleData[n01_data.gameOptions.scheduleEditIndex].limit_leg_count);
}


var oldWidth = 0;
function resize() {
	if (oldWidth !== 0 && oldWidth === $(window).width()) {
		// ソフトキーボード表示／非表示の可能性があるためサイズ変更しない
		return;
	}
	oldWidth = $(window).width();
	var windowSize = ($(window).width() < $(window).height()) ? $(window).width() : $(window).height();
	var bodyFont = windowSize * 0.06;
	$('body').css('font-size', bodyFont + 'px');
	$('input').css('font-size', bodyFont + 'px');
	$('select').css('font-size', bodyFont + 'px');

	var pMargin = windowSize * 0.02;
	$('p').css('margin-bottom', pMargin + 'px');

	var checkWidth = windowSize * 0.05;
	$('input[type="checkbox"]').css('width', checkWidth + 'px');
	var checkHeight = windowSize * 0.05;
	$('input[type="checkbox"]').css('height', checkHeight + 'px');

	var inputPadding = windowSize * 0.015;
	$('input[type="text"]').css('padding', inputPadding + 'px');
	$('input[type="number"]').css('padding', inputPadding + 'px');
	$('select').css('padding', inputPadding + 'px');

	var buttonPadding = windowSize * 0.02;
	$('input[type="button"]').css('padding', buttonPadding + 'px');

	var topPadding = windowSize * 0.02;
	$('#title_match_title').css('padding-top', topPadding + 'px');

	var detailFont = windowSize * 0.04;
	$('#menu_detail').css('font-size', detailFont + 'px');

	var indent = windowSize * 0.07;
	$('.indent').css('padding-left', indent + 'px');

	var menuPadding = windowSize * 0.03;
	$('#menu').css('padding-bottom', menuPadding + 'px');

	var hrMargin = windowSize * 0.05;
	$('hr').css('margin', hrMargin + 'px 0');

	n01_util.headerResize();
	
	if (lang === 'ja') {
		var cancelButtonWidth;
		if ($(window).width() < $(window).height()) {
			cancelButtonWidth = windowSize * 0.32;
		} else {
			cancelButtonWidth = windowSize * 0.27;
		}
		$('#td_button_cancel').css('width', cancelButtonWidth + 'px');
	}
	var headerHeight = $('#header_table').height();
	$('#header_back').css('height', headerHeight + 'px');
	$('#article').css('padding', headerHeight + 'px 0 0 0');
}
