/**
 * function:新弹窗登录逻辑
 * author：wwj，jzb
 * update：wendy
 * date：2016-10-26
 *
 * 依赖于  lib.js
 */
$(document).ready(function() {
	var usernameEmptyMsg = "请填写手机号/邮箱/用户名";
	var emailErrorMsg = "请输入正确的邮箱";
	var phoneEmptyMsg = "手机号不能为空";
	var phoneErrorMsg = "请输入正确的手机号";
	var pwdErrorMsg = "密码应为数字/字母/符号组合";
	var pwdBlankWhenSubmitMsg = "密码不能为空";
	var capthErrorMsg = "请输入4位图形验证码";
	var codeErrorMsg = "请输入4位图形验证码";
	var codeBlankErrorMsg = "请输入图形验证码";
	var phoneValidateMsg = "请输入正确的短信验证码";
	var phoneBlankErrorMsg = "短信验证码不可为空";
	var phoneNotExitsMsg = "<img src='images/promptok.png' />该手机号尚未注册，您可免注册直接登录";
	var userNameNotExitsMsg = "该用户尚未注册";
	var msgSendMsg = "<img src='images/promptok.png' /> 验证码已发送到手机,请查收!";
	var showPrompt = function() {
		if($.trim($(".Prompt").html())) {
			$(".Prompt").show().css({
				"height": "50px"
			}).prepend("<img src='/images/prompt.png' />");
		}
		if($.trim($("#phoneResult").html())) {
			$("#phoneResult").show().css({
				"height": "50px"
			}).prepend("<img src='/images/prompt.png' />");
		}
	};
	var setNumberTop = function() {
		setTimeout(function() {
			$(".publicNumber").animate({
				"top": ($(".wrap .wrap-list").height() - $(".publicNumber").height() + 66)
			});
		}, 300);
	};
	//通用方法调用处理
	TLibSSO.inputBase();
	setNumberTop();
	if(mobileLoginTab == "true") {
		var loginLbl = $(".wrap-login-center label:eq(1)");
		$(".evr").show().css({
			"left": loginLbl.position().left,
			"width": loginLbl.width()
		});
		showPrompt();
		$("#ordinaryLoginForm").hide();
		$("#mobileLoginForm").show();
	} else {
		showPrompt();
		$("#ordinaryLoginForm").show();
		$("#mobileLoginForm").hide();
		$(".evr").width($(".wrap-login-center label:first-child").width());
	}
	$(".login-form").hide().eq(mobileLoginTab ? 1 : 0).show();
	//使用input propertychange在IE7下stack overflow错误
	$("#mobileInput").on("keyup", function(event) {
		var phoneNum = $(this).val();
		if(!phoneNum) return;
		$(this).val(phoneNum.replace(/\D|^0/g, ''));
	})
	var isNeedTriggerUserNameBlurEvent = true;
	$(".wrap-login-center h3 label").click(function() {
		TLibSSO.clearPromptMsg();
		isNeedTriggerUserNameBlurEvent = false;
		var i = $(this).index();
		$(".evr").animate({
			"left": $(this).position().left,
			"width": $(this).width()
		}, 300);
		if($(this).children().attr("class") == "login_ordinary") {
			$(".login_ordinary").css({
				"background-position": "0px 0px",
				"color": "#288ff2"
			});
			$(".login_phone").css({
				"background-position": "0px -32px",
				"color": "#999"
			});
		} else {
			$(".login_ordinary").css({
				"background-position": "0px -29px",
				"color": "#999"
			});
			$(".login_phone").css({
				"background-position": "0px 0px",
				"color": "#288ff2"
			});
		}
		$("form").hide().eq(i).show();
		$("form").eq(0).children(".img_verification").hide();

		setNumberTop();
		var uName = $(".username").val();
		if(uName == "******")
			$(".username").val("")
	});

	function checkUserNameExist() {
		var username = $(".username").val();
		$.post(
				window.contextPath + 'user/isUserNameExist', {
					username: username
				},
				function(resp) {
					if(resp === 'false') {
						TLibSSO.showPromptMsg(null, userNameNotExitsMsg);
					}
				})
			.error(
				function(e) {
					TLibSSO.showPromptMsg($(".username").parent(), '用户名检测异常');
				});
	}
	// 用户名、手机、邮箱的验证

	var isDelayCheckUserName = false;
	$(".username").on("input propertychange", function() {
			//$(this).val($(this).val().replace(" ",""));
			if($(this).val().indexOf("@") != -1) {
				TLibSSO.showEmailList(".userName input");
				isNeedTriggerUserNameBlurEvent = true;
			} else {
				TLibSSO.hideEmailList();
			}
		})
		.blur(function(e) {
			if(!isNeedTriggerUserNameBlurEvent) {
				isNeedTriggerUserNameBlurEvent = true;
				return false;
			}
			var username = $(this).val();
			if(!$.trim(username) || username == $(this).attr("placeholder")) {
				TLibSSO.showPromptMsg($(this).parent(), usernameEmptyMsg);
				return false;
			} else if(username.indexOf("@") != -1 && !TLibSSO.isChina(username)) {
				isDelayCheckUserName = true;
				//如果是从emaillist点击获取的用户名，则需要过一段时间再进行检测
				setTimeout(function() {
					if(!TLibSSO.isEmail($(".username").val())) {
						TLibSSO.showPromptMsg($(this).parent(), emailErrorMsg);
					}
					isDelayCheckUserName = false;
					checkUserNameExist();
				}, 300);
			} else if(TLibSSO.isPhone(username)) {
				TLibSSO.clearPromptMsg();
			} else if($(this).val() != "") {
				TLibSSO.clearPromptMsg();
			} else {
				TLibSSO.showPromptMsg($(this).parent(), phoneErrorMsg);
			}
			if(!isDelayCheckUserName) {
				checkUserNameExist();
			}
			setNumberTop();
		});
	// 密码大小写
	$(".password .psd").keydown(function(evt) {
		evt = (evt) ? evt : window.event;
		if(evt.keyCode) {
			if(evt.keyCode == 20) {
				$(this).next("span").toggle();
			}
		}
	}).blur(function() {
		var pwd = $(this).val();
		var length = pwd.length;
		if(length == 0) {
			TLibSSO.showPromptMsg($(this).parent(), pwdErrorMsg);
		} else if(length < 6 || length > 24) {
			if(pwd != $(this).attr("placeholder"))
				TLibSSO.showPromptMsg($(this).parent(), pwdErrorMsg);
		} else {
			TLibSSO.clearPromptMsg();
		}
		setNumberTop();
	}).focus(function() {
		$("ul.email-list").remove();
	});
	// 密码的显示与隐藏
	$(".wrap-login-list .password b").click(function() {
		var pwdType = $(this).attr("class");
		if(pwdType == "m1") {
			$(this).removeClass("m1").parent().find("input").attr("type", "text");
		} else {
			$(this).addClass("m1").parent().find("input").attr("type", "password");
		}
		$(this).removeClass("m1").parent().find("input").attr("type", pwdType == "m1" ? "text" : "password");
	});
	$(".phone").blur(function() {
		$("ul.email-list").remove();
		var phoneNum = $(this).val();
		if(phoneNum == "" || phoneNum == $(this).attr("placeholder")) {
			TLibSSO.showPromptMsg($(this).parent(), phoneEmptyMsg);
		} else if(TLibSSO.isPhone(phoneNum)) {
			TLibSSO.clearPromptMsg();
			//检测动态码登录时，手机号是否已注册
			if($(this).attr("id") == "mobileInput") {
				$.post(
						window.contextPath + 'user/isPhoneExist', {
							username: phoneNum
						},
						function(resp) {
							if(resp === 'false') {
								TLibSSO.showPromptMsg(null, phoneNotExitsMsg);
							}
						})
					.error(
						function(e) {
							TLibSSO.showPromptMsg($(this).parent(), '检测手机号异常');
						});
			}
		} else {
			TLibSSO.showPromptMsg($(this).parent(), phoneErrorMsg);
		}
		setNumberTop();
	});
	$("input[name='captcha']").blur(function() {
		var captchaVal = $(this).val();
		if(!captchaVal || captchaVal == $(this).attr("placeholder")) {
			TLibSSO.showPromptMsg($(this).parent(), capthErrorMsg);
		} else if(captchaVal.length != 4) {
			TLibSSO.showPromptMsg($(this).parent(), capthErrorMsg);
		} else {
			TLibSSO.clearPromptMsg();
		}
		setNumberTop();
	});
	$('input[name="code"]').blur(function() {
		var codeVal = $(this).val();
		if(!codeVal || $(this).val() == $(this).attr("placeholder")) {
			TLibSSO.showPromptMsg($(this).parent(), codeBlankErrorMsg);
		} else if(!codeVal || codeVal.length != 4) {
			TLibSSO.showPromptMsg($(this).parent(), codeErrorMsg);
		} else {
			TLibSSO.clearPromptMsg();
		}
		setNumberTop();
	});
	$("#mobileCode").blur(function() {
		var mobileCodeVal = $(this).val();
		if(!mobileCodeVal || $(this).val() == $(this).attr("placeholder")) {
			TLibSSO.showPromptMsg($(this).parent(), phoneBlankErrorMsg);
		} else if(mobileCodeVal.length != 6) {
			TLibSSO.showPromptMsg($(this).parent(), phoneValidateMsg);
		} else {
			TLibSSO.clearPromptMsg();
		}
		setNumberTop();
	});
	// 手机发送验证码
	$(".verification").click(function() {
		var mobileInput = $("#mobileInput");
		var captchaInput = $("#mobileLoginForm input[name='captcha']");
		var username = mobileInput.val();
		var captcha = captchaInput.val();
		if(!username || username == mobileInput.attr("placeholder")) {
			TLibSSO.showPromptMsg(mobileInput.parent(), phoneEmptyMsg);
			return false;
		}
		if(!TLibSSO.isPhone(username)) {
			TLibSSO.showPromptMsg(mobileInput.parent(), phoneErrorMsg);
			return false;
		}
		if(!captcha || captcha == captchaInput.attr("placeholder")) {
			TLibSSO.showPromptMsg(captchaInput.parent(), capthErrorMsg);
			return false;
		}
		var countdown = 59;
		$(".verification").val("60s后重新获取").css({
			"background": "#ccc",
			"color": "#333",
			"border": "1px solid #eee"
		}).attr("disabled", true);
		var timer = setInterval(function() {
			if(countdown <= 0) {
				$(".verification").val("获取验证码").css({
					"background": "#448AF3",
					"color": "#fff",
					"border": "0px"
				}).attr("disabled", false);
				countdown = 59;
				window.clearInterval(timer);
			} else {
				$(".verification").val(countdown + "s后重新获取").css({
					"background": "#ccc",
					"color": "#333",
					"border": "1px solid #eee"
				}).attr("disabled", true);
				countdown--;
			}
		}, 1000);
		$.post(
				window.contextPath + 'user/loginAjaxFetchCode', {
					username: username,
					captcha: captcha
				},
				function(resp) {
					if(resp === 'true' || resp === true) {
						TLibSSO.showPromptMsg(null, msgSendMsg);
					} else {
						TLibSSO.showPromptMsg(captchaInput.parent(), resp || '短信验证码发送失败!');
						//刷新图形验证码
						$(".img_verification>img").click();
						$(".verification").val("获取验证码").css({
							"background": "#448AF3",
							"color": "#fff",
							"border": "0px"
						}).attr("disabled", false);
						window.clearInterval(timer);
					}
				})
			.error(
				function(e) {
					TLibSSO.showPromptMsg(captchaInput.parent(), '短信验证码发送失败,请重试!');
					$(".verification").val("获取验证码").css({
						"background": "#448AF3",
						"color": "#fff",
						"border": "0px"
					}).attr("disabled", false);
					window.clearInterval(timer);
				});

	});
	$("#ordinaryLoginForm").on("submit", function() {
		var uName = $(".username").val();
		var pwd = $.trim($("input[type=password]").val());
		var canSubmit = false;
		if(!$.trim(uName) || $.trim(uName) == $(".username").attr("placeholder")) {
			TLibSSO.showPromptMsg($(".username").parent(), usernameEmptyMsg);
		} else if(!pwd || pwd == $(this).attr("placeholder")) {
			TLibSSO.showPromptMsg($("input[type=password]").parent(), pwdBlankWhenSubmitMsg);
		} else if(pwd.length < 4 || pwd.length > 24) {
			TLibSSO.showPromptMsg($("input[type=password]").parent(), pwdErrorMsg);
		} else if(errorCount >= 3 && !$.trim($('input[name="code"]').val())) {
			TLibSSO.showPromptMsg($('input[name="code"]').parent(), '图像验证码不能为空!');
		} else {
			TLibSSO.clearPromptMsg();
			canSubmit = true;
		}
		setNumberTop();
		return canSubmit;
	});
	//提交前验证
	$("#mobileLoginForm").on("submit", function() {
		var phone = $("#mobileInput").val();
		var mobileCode = $.trim($("#mobileCode").val());
		var captcha = $.trim($('input[name="captcha"]').val());
		var canSubmit = false;
		if(!$.trim(phone) || $.trim(phone) == $("#mobileInput").attr("placeholder")) {
			TLibSSO.showPromptMsg($("#mobileInput").parent(), phoneEmptyMsg);
		} else if(!captcha || captcha == $('input[name="captcha"]').attr("placeholder")) {
			TLibSSO.showPromptMsg($('input[name="captcha"]').parent(), capthErrorMsg);
		} else if(!mobileCode || mobileCode == $("#mobileCode").attr("placeholder")) {
			TLibSSO.showPromptMsg($("#mobileCode").parent(), phoneBlankErrorMsg);
		} else if(mobileCode.length != 6) {
			TLibSSO.showPromptMsg($("#mobileCode").parent(), phoneValidateMsg);
		} else {
			TLibSSO.clearPromptMsg();
			canSubmit = true;
		}
		setNumberTop();
		//		if($.trim($(this).closest("form").find(".Prompt").html())){
		//			return false;
		//		}
		return canSubmit;
	});
	// 弹出微信分享框
	$(".publicNumber").mouseover(function() {
		$(this).stop().animate({
			"left": "414px"
		});
	}).mouseout(function() {
		$(this).stop().animate({
			"left": "265px"
		});
	});
	$("#login_ordinary").on("click", function() {
		$("#forgetPwdTags").show();
	})
	$("#login_phone").on("click", function() {
		$("#forgetPwdTags").hide();
	})
});