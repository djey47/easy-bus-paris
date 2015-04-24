define([   'jquery'],
function ( $ ) {
    return {
        navSelect : function(item) {
            $("li[id^=item]").attr("class","");
            if (item) {
                $("li[id=" + item + "]").attr("class","active");
            }
        },

        hideStatusBar : function() {
            $('#statusBar').closest("nav").hide();
        },

        showStatusBar : function() {
            $('#statusBar').closest("nav").show();
        }

    };
});