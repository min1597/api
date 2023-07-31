var $el = $("#layerExchange");
var diff = parseFloat("10");
var coinPair = "Bitcoin";
var destCoin = "USDT"
var pureNum = curCnt;
$("#invest_market").html(coinPair);
$("#invest_position").html("Up");
$("#realAmount").html(numbeComma(pureNum/pointUnit) + pointUnitText);
$("#roundNo").html($('[data-role=game-round]').text());
$("#roundStartTime").html(gameStartTime);
$("#liquidationDiff").html( ("+") + diff + destCoin );
$("#liquidationValue").html($("#realAmount").html() + " * 1.92 = " + numbeComma((pureNum * 1.92)/pointUnit) + pointUnitText);
$(".pop_ok_btn.buy-btn").css("display", "inline-block");
$(".pop_ok_btn.sell-btn").css("display", "none");
$(".pop_botDiv .main-label").removeClass("buy-position").removeClass("sell-position").addClass("buy-position");

$("[id^='layer']").css({display: 'none'});
$el.css({display: 'block'});
$('.dim-layer').fadeIn();

var $elWidth = ~~($el.outerWidth()), $elHeight = ~~($el.outerHeight()), docWidth = $(document).width(), docHeight = $(document).height();


if ($elHeight < docHeight || $elWidth < docWidth) {
    $el.css({
        marginTop : -$elHeight / 2,
        marginLeft : -$elWidth / 2
    });
} else {
    $el.css({
        top : 10,
        left : 0
    });
}

$el.find('a.btn-layerClose').click(function() {
    $('.dim-layer').fadeOut();
    return false;
});