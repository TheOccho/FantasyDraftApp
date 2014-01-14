define("view/chat/Chat", function( require, exports, module ) {

	var AbstractFantasyDraftView = require("view/AbstractFantasyDraftView"),
		controller = require("controller/FantasyDraftController"),
		bot = require("controller/FantasyDraftBot"),
		eventEnums = require("enums/EventEnums"),
		botEnums = require("enums/BotCommandEnums");

	return AbstractFantasyDraftView.extend({
		label: "chat",
		addViewListeners: function() {
			var that = this;
			//send chat button click
			$(document).on("click", this.__targetDiv + " #chat-btn", function(e) {
				var msg = that.element.find("#chat-input").val();
				bot.sendChatMessage(msg);
				//clear out send message field and disable send button
				that.element.find("#chat-input").val("");
				$(this).addClass("disabled");
			});

			//keyup listener to enable/disable send chat button
			$(document).on("keyup", this.__targetDiv + " #chat-input", function(e) {
				if($(this).val() !== "") {
					that.element.find("#chat-btn").removeClass("disabled");
				} else {
					that.element.find("#chat-btn").addClass("disabled");
				}
			});
		},
		renderChatMessage: function(msg) {
			var chatBoxElement = this.element.find("#chatbox");
			chatBoxElement.append(msg);
			//auto-scroll to bottom
			chatBoxElement.scrollTop(chatBoxElement[0].scrollHeight);
		},
		handleRenderNewChatMessage: function(evt, args) {
			var msgObj = args;
			var managerData = controller.getLeague().getManagerByID(msgObj.managerID);
			this.renderChatMessage('<div class="chat-message"><b>'+managerData.getName()+'</b>: '+msgObj.message+'</div>');
		},
		handlePlayerDrafted: function(evt, args) {
			var playerDrafted = args;
			var managerData = controller.getLeague().getManagerByID(playerDrafted.getOwnerID());
			var playerData = controller.getPlayerRoster().getPlayerByID(playerDrafted.getPlayerID());
			this.renderChatMessage('<div class="chat-message bot"><b>'+managerData.getName()+" selects "+playerData.getFullName()+ " ("+playerData.getTeamAbbrev().toUpperCase()+", "+playerData.getPrimaryPosition()+')</b></div>')
		},
		init: function(div, template) {
			this._super(div, template);

			this.connect([{event:eventEnums.PLAYER_DRAFTED, handler:$.proxy(this.handlePlayerDrafted, this)},
						  {event:botEnums.RENDER_NEW_CHAT_MESSAGE, handler:$.proxy(this.handleRenderNewChatMessage, this)}]);

			this.addViewListeners();
		}
	}).prototype;
});