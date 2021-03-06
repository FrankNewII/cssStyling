;(function () {

    "use strict";

    //Since in 2013, not read this shit, just forget
    if (!localStorage)
        throw new Error("Your browser not support LocalStorage");

    var
        version = "atrtemka",
        editableElements = [],
        timeToRefresh = 2000,
        depthOfElementPath = 3;


    var
        _checkNewStyle = 0,
        _reservedIds = [],
        _selectFirstElementChecker = true,
        _showingElementItem = false,
        _editableElements = [],
        _reservedClassNames = [],
        _closedElements = ['html', 'head', 'script', 'noscript'],
        _timerId,
        _currentElement;

    var
        workSpace = {
            styling: {
                elementType: 'style',
                id: 'tmpCssStyle'
            },
            tooltip: {
                autoRender: false,
                id: 'itemMenu',
                style: 'position: absolute; padding: 10px 20px; border: 1px solid #b3c9ce;border-radius: 4px;text-align: center;font: italic 14px/2 arial, sans-serif;color: #333; width: 200px; background: #fff;box-shadow: 3px 3px 3px rgba(0, 0, 0, .3);',
            },
            closeButton: {
                autoRender: false,
                id: 'closeTooltipButton',
                innerHTML: 'X',
                elementType: 'button',
                style: 'float: right; background: transparent; border: 1px solid red; border-radius: 3px; color: red;cursor: pointer;',
                onclick: function close() {
                    _showingElementItem.remove();
                }
            },
            blackScreen: {
                autoRender: false,
                elementType: 'div',
                id: 'blackScreen',
                style: 'background: rgba(0, 0, 0, 0.36); position: fixed; height: 100%; width: 100%; top: 0; left: 0; z-index: 10000;',
                innerHTML: 'firstButton'
            },
            addSpecSelector: {
                autoRender: false,
                elementType: 'input',
                style: 'width:100%;',
                id: 'specSelector'
            },
            cssRulesForSelector: {
                autoRender: false,
                elementType: 'textarea',
                style: 'resize: vertical; width: 100%;',
                id: 'cssRules'
            },
            buttonAddSpecCSS: {
                autoRender: false,
                elementType: 'button',
                id: 'buttonAddSpecCSS',
                innerHTML: 'Add selector and rules',
                style: 'background: transparent;border: 1px solid #1DB648;border-radius: 3px;color: #1DB648;cursor: pointer;',
                onclick: function specStyle() {
                    var path = '';
                    var pathElem = document.querySelector('#' + workSpace.addSpecSelector.id);
                    if (pathElem.value) {
                        path = pathElem.value;
                    } else {
                        path = getPath(_currentElement);
                    }
                    localStorage.setItem(
                        "cssStyle: " + path,
                        document.querySelector('#' + workSpace.cssRulesForSelector.id).value
                    );
                }
            },
            closeWorkSpace: {
                autoRender: false,
                elementType: 'button',
                id: 'closeWorkSpace',
                style: 'background: rgba(0, 0, 0, 0); position: fixed; color: gray; top: 20px; right: 20px; z-index: 10001; font-size: 40px;',
                innerHTML: '×',
                onclick: function closeWorkspace() {
                    document.querySelector('#' + workSpace.blackScreen.id).style.display = "none";
                    document.querySelector('#' + workSpace.closeWorkSpace.id).style.display = "none";
                }
            }

        };

    function addElement(element, place) {
        var elem = document.createElement((element.elementType || 'div'));

        elem.setAttribute('style', element.style);
        elem.setAttribute('id', element.id);

        if (element.innerHTML)
            elem.innerHTML = element.innerHTML;

        if (element.onclick)
            elem.onclick = element.onclick;


        if (!place)
            document.body.appendChild(elem);
        else
            document.querySelector(place).appendChild(elem);

        return elem;
    }

    function _syntaxHighlightingInCssSelectors(text) {
        return text.replace(/[.#:]?\w+\b/ig, function (substr) {
            if (~substr.indexOf('#')) {
                return '<span style="color:red;">' + substr + "</span>";
            }
            else if (~substr.indexOf('.')) {
                return '<span style="color:yellow;">' + substr + "</span>";
            }
            else if (~substr.indexOf(':')) {
                return '<span style="color:orange;">' + substr + "</span>";
            }
            else {
                return '<span style="color:blue;">' + substr + "</span>";
            }
        });
    }

    function _findClassesInCSS(text, place) {

    }

    function _findTagsInCSS(text, place) {

    }

    function addNewReservedElementsSelectors() {

        var selector;

        if (inArray('.', arguments[i]))
            _reservedClassNames.unshift(arguments[i]);

        if (inArray('#', arguments[i]))
            _reservedIds.unshift(arguments[i]);
    }

    function checkAndDeleteEmptyItemInLocalStorage() {
        for (var key in localStorage) {
            if (localStorage.hasOwnProperty(key) && !localStorage.getItem(key))
                localStorage.removeItem(key);
        }
    }

    function getPath(elem) {

        if (!(elem instanceof Element))
            return;

        var
            path = [],
            classesCount = 0,
            selector = "";

        while (elem.nodeType === Node.ELEMENT_NODE) {
            selector = "";
            if (elem.id) {
                selector += '#' + elem.id;
                path.unshift(selector);
                break;
            }
            else if (elem.className) {
                selector += '.' + elem.className.split(' ')[0];
                ++classesCount;
                if (classesCount < depthOfElementPath) continue;
                path.unshift(selector);
                break;
            }
            else {
                selector += elem.nodeName.toLowerCase();
            }
            path.unshift(selector);
            elem = elem.parentNode;
        }
        return path.join(" ");
    }

    function autoSaveStyle() {

        var
            styledElements = document.querySelectorAll('[style]');

        for (var key in styledElements) {

            if (
                (styledElements[key] instanceof HTMLElement) && !inArray(_reservedIds, styledElements[key].id) &&
                styledElements[key].style
            ) {

                localStorage.setItem(
                    "cssStyle: " + getPath(styledElements[key]),
                    styledElements[key].getAttribute('style')
                );

                //styledElements[key].removeAttribute("style");
            }
        }
    }

    function updateStyles() {
        if (_checkNewStyle === localStorage.length)
            return;

        var
            styles = "",
            style;

        for (var elemQuery in localStorage) {
            if (inArray(elemQuery, "cssStyle: "))
                styles += elemQuery.replace("cssStyle: ", "") + "{" + localStorage.getItem(elemQuery) + "}\n";
        }

        if (document.querySelector('head style')) {
            document.querySelector('head style').innerHTML = styles;
        }
        else {
            workSpace.styling.innerHTML = styles;
            addElement(workSpace.styling, 'head')
        }
        _checkNewStyle = localStorage.length;
    }

    function makeCopyOfElement(elem) {
        return elem.cloneNode(true);
    }

    function inArray(arr, value) {

        return !!~arr.indexOf(value);
    }

    function editElement(a, b, c) {

        var
            workSpace = document.querySelector('#blackScreen'),
            closeWorkSpace = document.querySelector('#closeWorkSpace');

        if (_selectFirstElementChecker) {
            workSpace.style.display = "block";
            closeWorkSpace.style.display = "block";
            workSpace.appendChild(makeCopyOfElement(a.toElement));
            _selectFirstElementChecker = false;
            setTimeout(function () {
                _selectFirstElementChecker = true;
            }, 1000);
        }
    }

    function init(options) {

        _timerId = setTimeout(function tick() {
            autoSaveStyle();
            updateStyles();
            _timerId = setTimeout(tick, timeToRefresh);
        }, 4);

        /*
         Initialize workspace.
         Add all Id's and classNames of workspace elements to resorved.
         */

        for (var key in workSpace) {

            if (!workSpace.hasOwnProperty(key))
                continue;

            if (workSpace[key].id)
                _reservedIds.unshift(workSpace[key].id);

            if (workSpace[key].className)
                _reservedClassNames.unshift(workSpace[key].className);

            if (workSpace[key].autoRender)
                addElement(workSpace[key]);
        }

        document.body.onclick = function (e) {
            return false;
        };

        document.body.ondblclick = function (e) {
            var elem = e.target,
                coords,
                left,
                top,
                menuElem;
            _currentElement = elem;

            if (_showingElementItem)
                _showingElementItem.remove();

            if (
                !inArray(_closedElements, elem.localName) && !inArray(_reservedIds, elem.id) && !inArray(_reservedClassNames, elem.className)) {
                menuElem = addElement(workSpace.tooltip);

                coords = elem.getBoundingClientRect();

                left = coords.left + (elem.offsetWidth - menuElem.offsetWidth) / 2;
                if (left < 0) left = 0;

                top = coords.top - menuElem.offsetHeight - 5;
                if (top < 0)
                    top = coords.top + elem.offsetHeight + 5;

                menuElem.style.left = left + 'px';
                menuElem.style.top = top + +window.scrollY + 'px';
                menuElem.innerHTML = getPath(elem);
                _showingElementItem = menuElem;
                addElement(workSpace.closeButton, '#' + workSpace.tooltip.id);
                addElement(workSpace.addSpecSelector, '#' + workSpace.tooltip.id);
                addElement(workSpace.cssRulesForSelector, '#' + workSpace.tooltip.id);
                addElement(workSpace.buttonAddSpecCSS, '#' + workSpace.tooltip.id);
            }
        }
    }

    window.initializeCSSStyling = init;
})();