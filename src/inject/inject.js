chrome.extension.sendMessage({}, function(response) {
  var trial;
  var commentsLoadedInterval, readyStateCheckInterval;

  var startLoading = function() {
    clearInterval(readyStateCheckInterval);
    readyStateCheckInterval = setInterval(function() {
      if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        trial = 0;
        clearInterval(commentsLoadedInterval);
        commentsLoadedInterval = setInterval(loadExtension, 1000);
      }
    }, 10);
  };

  var loadExtension = function() {
    var comments = document.querySelectorAll(
      "table:not([style='display:none']) .js-comments-holder"
    );
    var toolbox = document.querySelector(".pr-review-tools");
    var gtprcnContent = document.querySelector(".gtprcn-content");

    if (comments.length || trial >= 20) {
      clearInterval(commentsLoadedInterval);
    }

    if (comments.length && toolbox) {
      if (gtprcnContent) {
        gtprcnContent.parentNode.removeChild(gtprcnContent);
      }

      var defaultOffsetToAdd = 200;
      var selectedComment;

      function offset(el) {
        var rect = el.getBoundingClientRect(),
          scrollLeft =
            window.pageXOffset || document.documentElement.scrollLeft,
          scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
      }

      var content = document.createElement("span");
      var prevCommentButton = document.createElement("button");
      var nextCommentButton = document.createElement("button");
      prevCommentButton.innerHTML = "▲";
      nextCommentButton.innerHTML = "▼";

      var commentsLabel = document.createElement("div");

      commentsLabel.classList = "diffbar-item gthprcm-comment-label";

      content.classList = "gtprcn-content";
      prevCommentButton.classList = nextCommentButton.classList =
        "btn btn-sm diffbar-item";
      prevCommentButton.disabled = true;

      content.appendChild(prevCommentButton);
      content.appendChild(commentsLabel);
      content.appendChild(nextCommentButton);

      toolbox.appendChild(content);

      function updateLabel(number) {
        number = number || selectedComment + 1;
        commentsLabel.innerHTML =
          "💬 Comments (" + number + "/" + comments.length + ")";
      }

      updateLabel("0");

      function getPrevComment() {
        var prevComment = selectedComment - 1;

        prevCommentButton.disabled = prevComment === 0;
        nextCommentButton.disabled = false;

        if (selectedComment && prevComment >= 0) {
          selectedComment = prevComment;
          updateLabel();
          return selectedComment;
        }

        selectedComment = 0;
        updateLabel();

        return selectedComment;
      }

      function getNextComment() {
        var nextComment = selectedComment + 1;
        var maxLimit = comments.length - 1;

        nextCommentButton.disabled = nextComment === maxLimit;
        prevCommentButton.disabled = false;

        if (!selectedComment && nextComment <= maxLimit) {
          selectedComment = nextComment;
          updateLabel();

          return selectedComment;
        }

        selectedComment = !selectedComment ? 0 : maxLimit;
        updateLabel();

        return selectedComment;
      }

      prevCommentButton.onclick = function() {
        window.scroll(
          0,
          offset(
            document.querySelectorAll(
              "table:not([style='display:none']) .js-comments-holder"
            )[getPrevComment()]
          ).top - defaultOffsetToAdd
        );
      };

      nextCommentButton.onclick = function() {
        window.scroll(
          0,
          offset(
            document.querySelectorAll(
              "table:not([style='display:none']) .js-comments-holder"
            )[getNextComment()]
          ).top - defaultOffsetToAdd
        );
      };
    }
  };

  window.addEventListener("pushstate", function() {
    if (window.location.href.match(/\/files$/)) {
      startLoading();
    }
  });

  window.addEventListener("popstate", function() {
    if (window.location.href.match(/\/files$/)) {
      startLoading();
    }
  });

  window.addEventListener("pjax:end", function() {
    if (window.location.href.match(/\/files$/)) {
      startLoading();
    }
  });

  startLoading();
});
