/**
  * This content script initializes the stylebot widget
 **/

lintDebug = false;

$( document ).ready(function() {
    initDebug();
    stylebot.chrome.fetchOptions();
});

// callback for request sent to background.html in stylebot.chrome.fetchOptions()
function initialize( response ) {
    stylebot.initialize( response.options );
    // init accordion state
    stylebot.widget.basic.enabledAccordions = response.enabledAccordions;
    addDOMListeners();
}

function initDebug() {
    if( lintDebug )
        jQuery.LINT.level = 3;
    else
        jQuery.LINT.level = 0;
}

function addDOMListeners() {
    // Handle key presses
    
    $( document ).keydown( function(e) {
        var eTagName = e.target.tagName.toLowerCase();
        var disabledEl = [ 'input', 'textarea', 'div', 'object', 'select' ];
        if( $.inArray(eTagName, disabledEl) != -1 )
           return true;

        // Handle shortcut key combo 'ctrl + e' to toggle editing mode
        if( stylebot.options.useShortcutKey && e.keyCode == stylebot.options.shortcutKey )
        {
            if( stylebot.options.shortcutMetaKey == 'ctrl' && e.ctrlKey
              || stylebot.options.shortcutMetaKey == 'shift' && e.shiftKey
              || stylebot.options.shortcutMetaKey == 'alt' && e.altKey
              || stylebot.options.shortcutMetaKey == 'none' )
            stylebot.toggle();
        }
        
        // Handle Esc key to escape editing mode
        else if( e.keyCode == 27 && stylebot.status && !WidgetUI.isColorPickerVisible && !stylebot.modal.isVisible )
            stylebot.disable();
    })

    // Handle mouse move event on DOM elements
    .mousemove( function(e) {
        if( stylebot.widget.isBeingDragged || stylebot.modal.isVisible )
            return true;
        if( stylebot.hoveredElement == $(e.target) || !stylebot.status || !stylebot.selectionStatus )
            return true;

        var parent = $(e.target).closest( '#stylebot, .stylebot_colorpicker' );
        var id = $(e.target).attr('id');
        
        if( id.indexOf("stylebot") != -1 || parent.length != 0 )
        {
            stylebot.unhighlight();
            return true;
        }
        stylebot.highlight( e.target );
    });
    
    // Handle click event on document.body (during capturing phase)
    document.body.addEventListener('click', function(e) {
        if( stylebot.hoveredElement && stylebot.status && stylebot.selectionStatus )
        {
            e.preventDefault();
            e.stopPropagation();
            stylebot.select();
            return false;
        }
        return true;
    }, true );
}