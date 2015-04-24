define(['backbone'],
function(Backbone) {
    return Backbone.View.extend({
        tagName: 'tr',
        className: 'oneLinePerPOI',
        events: {
            "click": "clickMe"
        },
        render: function () {
            this.$el.html(this.options.template(this.model.toJSON()));
            return this;
        },
        clickMe: function () {
            this.$el.siblings().removeClass('selected');
            this.$el.addClass('selected');
            Backbone.trigger('poi:show', this.model);
        }
    });
});