const ASSET_VERSION = 45;

document.addEventListener("contextmenu", function (event) {
	event.preventDefault();
});

function handlePress() {
	this.classList.add("pressed");
}

function handleRelease() {
	this.classList.remove("pressed");
}

document.querySelectorAll(".projectItem").forEach(function (button) {
	button.addEventListener("mousedown", handlePress);
	button.addEventListener("mouseup", handleRelease);
	button.addEventListener("mouseleave", handleRelease);
	button.addEventListener("touchstart", handlePress);
	button.addEventListener("touchend", handleRelease);
	button.addEventListener("touchcancel", handleRelease);
});

function toggleClass(selector, className) {
	document.querySelectorAll(selector).forEach(function (element) {
		element.classList.toggle(className);
	});
}

function pop(imageURL) {
	if (imageURL) {
		document.querySelector(".tc-img").src = imageURL;
	}
	toggleClass(".tc-main", "active");
	toggleClass(".tc", "active");
}

document.querySelector(".tc").addEventListener("click", function () {
	pop();
});

document.querySelector(".tc-main").addEventListener("click", function (event) {
	event.stopPropagation();
});

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var cookies = document.cookie.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i];
		while (cookie.charAt(0) === " ") {
			cookie = cookie.substring(1);
		}
		if (cookie.indexOf(nameEQ) === 0) {
			return cookie.substring(nameEQ.length);
		}
	}
	return null;
}

document.addEventListener("DOMContentLoaded", function () {
	var html = document.querySelector("html");
	var snake = document.getElementById("snake");
	var checkbox = document.getElementById("myonoffswitch");
	var themeState = getCookie("themeState") || "Light";

	function changeTheme(theme) {
		snake.src = "./static/svg/snake-" + theme + ".svg?v=" + ASSET_VERSION;
		html.dataset.theme = theme;
		setCookie("themeState", theme, 365);
		themeState = theme;
	}

	checkbox.addEventListener("change", function () {
		changeTheme(themeState === "Dark" ? "Light" : "Dark");
	});

	if (themeState === "Dark") {
		checkbox.checked = false;
	}

	changeTheme(themeState);
});

window.addEventListener("load", function () {
	var loader = document.querySelector("#loader");
	setTimeout(function () {
		loader.addEventListener("transitionend", function () {
			loader.remove();
		});
		loader.classList.add("reveal");
	}, 100);
});
