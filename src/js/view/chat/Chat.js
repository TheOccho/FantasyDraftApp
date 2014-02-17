define("view/chat/Chat", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		bot = require("bot/FantasyDraftBot"),
		eventEnums = require("enums/EventEnums"),
		botEnums = require("enums/BotCommandEnums");

	return AbstractFantasyDraftView.extend({
		label: "chat",
		addViewListeners: function() {
			var that = this;
			//send chat button click
			$(document).on("click", this.__targetDiv + " #chat-btn", $.proxy(this.sendChatMessage, this));

			//keyup listener to enable/disable send chat button
			$(document).on("keyup", this.__targetDiv + " #chat-input", function(e) {
				if($(this).val() !== "") {
					that.element.find("#chat-btn").removeClass("disabled");
				} else {
					that.element.find("#chat-btn").addClass("disabled");
				}
			});

			//enter key handler to send chat
			$(document).on("focus", this.__targetDiv + " #chat-input", function(e) {
				var chatInput = $(this);
				$(window).on("keydown", function(e) {
					if(e.keyCode === 13 && chatInput.val() !== "") {
						that.sendChatMessage();
					}
				});
			});

			//remove handler when chat input loses focus
			$(document).on("blur", this.__targetDiv + " #chat-input", function(e) {
				$(window).off("keydown");
			});
		},
		sendChatMessage: function() {
			var msg = this.element.find("#chat-input").val();
			bot.sendChatMessage(msg);
			//clear out send message field and disable send button
			this.element.find("#chat-input").val("");
			$(this.__targetDiv + " #chat-btn").addClass("disabled");
			this.element.find("#chat-input").blur();
		},
		renderChatMessage: function(msg) {
			var chatBoxElement = this.element.find("#chatbox");
			chatBoxElement.append(msg);
			//auto-scroll to bottom
			chatBoxElement.scrollTop(chatBoxElement[0].scrollHeight);
		},
		handleRenderNewChatMessage: function(evt, args) {
			var botMessageVO = args;
			if(botMessageVO.getFrom() === "bot") {
				this.renderChatMessage('<div class="chat-message bot"><b>'+botMessageVO.getBody()+'</b></div>');
			} else {
				var managerData = controller.getLeague().getManagerByID(botMessageVO.getFrom());
				this.renderChatMessage('<div class="chat-message"><b>'+managerData.getName()+'</b>: '+botMessageVO.getBody()+'</div>');
			}
		},
		init: function(div, template) {
			this._super(div, template);

			this.connect([{event:botEnums.RENDER_NEW_CHAT_MESSAGE, handler:$.proxy(this.handleRenderNewChatMessage, this)}]);

			this.addViewListeners();
		}
	}).prototype;
});