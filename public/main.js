document.addEventListener('DOMContentLoaded', () => {
  if (document.body.id === 'home') {
    loadPosts();
    const notificationBar = document.getElementById('notification-bar');
    const closeNotificationButton = document.getElementById('close-notification');
    if (localStorage.getItem('notificationClosed') === 'true') {
      notificationBar.style.display = 'none';
    } else {
      closeNotificationButton.addEventListener('click', () => {
        notificationBar.style.display = 'none';
        localStorage.setItem('notificationClosed', 'true');
      });
    }
    document.getElementById('close-notification').addEventListener('click', function() {
      document.getElementById('notification-bar').style.display = 'none';
    });
  } else if (document.body.id === 'post') {
    loadSinglePost();
    setupImagePopup();
  }
});

function setupImagePopup() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="image-popup-overlay" class="hidden"></div>
    <div id="image-popup" class="popup hidden">
      <div class="popup-content">
        <span class="close">&times;</span>
        <img id="popup-image" src="" alt="Image">
        <div class="popup-actions">
          <button id="copy-url">Copy Image URL</button>
        </div>
      </div>
    </div>
  `);

  const imagePopupOverlay = document.getElementById('image-popup-overlay');
  const imagePopup = document.getElementById('image-popup');
  const popupImage = document.getElementById('popup-image');
  const closePopup = imagePopup.querySelector('.close');
  const copyUrlButton = document.getElementById('copy-url');

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('embedded-media')) {
      const imageUrl = event.target.src;
      popupImage.src = imageUrl;
      imagePopup.classList.remove('hidden');
      imagePopupOverlay.classList.remove('hidden');
    }
  });

  closePopup.addEventListener('click', () => {
    imagePopup.classList.add('hidden');
    imagePopupOverlay.classList.add('hidden');
  });

  copyUrlButton.addEventListener('click', () => {
    const imageUrl = popupImage.src;
    navigator.clipboard.writeText(imageUrl).then(() => {
      alert('Image URL copied to clipboard');
    }).catch(err => {
      console.error('Error copying URL:', err);
    });
  });
}

function formatDate(dateString) {
  try {
    let date = new Date(dateString);
    let userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC+2";
    let formattedDate = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(date);

    return `<span class="date-box" title="Timezone: ${userTimezone}">${formattedDate.replace(",", "").replace(/\//g, "-")}</span>`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return `<span class="date-box" title="Timezone: UTC+2">${dateString} (UTC+2)</span>`;
  }
}

function loadPosts() {
  fetch('/api/posts')
    .then(response => response.json())
    .then(data => {
      if (!data.items) {
        console.error("No items found in data:", data);
        return;
      }

      const container = document.getElementById('posts-container');
      const posts = data.items.sort((a, b) => new Date(b.fields.date) - new Date(a.fields.date));
      posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post-item';
        if (post.fields.image) {
          postDiv.style.backgroundImage = `url(${post.fields.image})`;
        } else {
          postDiv.classList.add('no-image');
        }
        postDiv.innerHTML = `
          <div class="post-content">
            <h2>${post.fields.title}</h2>
            <small>${formatDate(post.fields.date)}</small>
            <p>${post.fields.description}</p>
          </div>
        `;
        postDiv.addEventListener('click', () => {
          window.location.href = `${post.sys.id}`;
        });
        container.appendChild(postDiv);
      });
    })
    .catch(err => console.error('Error loading posts:', err));
}

function loadSinglePost() {
  const postId = window.location.pathname.split('/').pop();
  if (!postId) {
    document.getElementById('post-container').innerHTML = '<p>Post not found.</p>';
    return;
  }
  fetch(`/api/posts/${postId}`)
    .then(response => response.json())
    .then(post => {
      if (!post.fields) {
        document.getElementById('post-container').innerHTML = '<h2 style="margin-top: 10%;">404</h2><p>Post not found...</p>';
        return;
      }
      document.title = post.fields.title + " · sipped/blog";
      document.querySelector('meta[property="og:title"]').setAttribute("content", post.fields.title + " · sipped/blog");
      document.querySelector('meta[property="og:description"]').setAttribute("content", post.fields.summary || post.fields.description || post.fields.title);
      const container = document.getElementById('post-container');
      const assetId = post.fields.image && post.fields.image.sys ? post.fields.image.sys.id : null;
      let postContentHtml = "";
      if (post.fields.content) {
        postContentHtml = renderRichText(post.fields.content, post.includes);
      }
      container.innerHTML = `
        ${assetId ? `<span class="asset-placeholder asset-placeholder-header" data-asset-id="${assetId}">Loading media...</span>` : ''}
        <h2>${post.fields.title}</h2>
        <small>${formatDate(post.fields.date)}</small>
        ${post.fields.summary ? `
          <div class="summary-dropdown">
            <button class="summary-button" onclick="toggleSummary(this);">
              <i class="fas fa-info-circle"></i> <b>TL;DR.</b> Wanna read the summary of this post?
              <i class="fas fa-chevron-down dropdown-icon"></i>
            </button>
            <div class="summary-content hidden">${post.fields.summary}</div>
          </div>
        ` : ''}
        <div>${postContentHtml}</div>
      `;
      loadEmbeddedAssets();
    })
    .catch(err => console.error('Error loading post:', err));
}

function toggleSummary(button) {
  const summaryContent = button.nextElementSibling;
  const dropdownIcon = button.querySelector('.dropdown-icon');
  summaryContent.classList.toggle('hidden');
  dropdownIcon.classList.toggle('fa-chevron-down');
  dropdownIcon.classList.toggle('fa-chevron-up');
}

function getAssetUrl(assetLink, includes) {
  if (!assetLink) return null;
  if (assetLink.fields && assetLink.fields.file && assetLink.fields.file.url) {
    return assetLink.fields.file.url.startsWith('//') 
      ? 'https:' + assetLink.fields.file.url 
      : assetLink.fields.file.url;
  }
  let assetId;
  if (assetLink.sys && assetLink.sys.id) {
    assetId = assetLink.sys.id;
  } else if (assetLink.id) {
    assetId = assetLink.id;
  } else {
    return null;
  }
  if (includes && includes.Asset) {
    const asset = includes.Asset.find(a => a.sys.id === assetId);
    if (asset && asset.fields && asset.fields.file && asset.fields.file.url) {
      return asset.fields.file.url.startsWith('//')
        ? 'https:' + asset.fields.file.url
        : asset.fields.file.url;
    }
  }
  return null;
}

function renderRichText(content, includes) {
  if (!content || !content.content) return "";
  return content.content.map(block => {
    switch (block.nodeType) {
      case 'paragraph':
        return `<p>${renderText(block.content)}</p>`;
      case 'heading-1':
        return `<h1>${renderText(block.content)}</h1>`;
      case 'heading-2':
        return `<h2>${renderText(block.content)}</h2>`;
      case 'heading-3':
        return `<h3>${renderText(block.content)}</h3>`;
      case 'heading-4':
        return `<h4>${renderText(block.content)}</h4>`;
      case 'heading-5':
        return `<h5>${renderText(block.content)}</h5>`;
      case 'heading-6':
        return `<h6>${renderText(block.content)}</h6>`;
      case 'unordered-list':
        return `<ul>${block.content.map(item => `<li>${renderRichText({ content: item.content }, includes)}</li>`).join('')}</ul>`;
      case 'ordered-list':
        return `<ol>${block.content.map(item => `<li>${renderRichText({ content: item.content }, includes)}</li>`).join('')}</ol>`;
      case 'blockquote':
        return `<blockquote>${renderText(block.content)}</blockquote>`;
      case 'hr':
        return `<hr>`;
      case 'table':
        return `<table>${block.content.map(row => `<tr>${row.content.map(cell => {
          const cellTag = cell.nodeType === "table-header-cell" ? "th" : "td";
          return `<${cellTag}>${renderRichText({ content: cell.content }, includes)}</${cellTag}>`;
        }).join('')}</tr>`).join('')}</table>`;
      case 'code-block':
        return `<pre><code>${block.content.map(text => text.value).join('')}</code></pre>`;
      case 'embedded-asset-block':
        if (block.data && block.data.target && block.data.target.sys && block.data.target.sys.id) {
          const assetId = block.data.target.sys.id;
          return `<span class="asset-placeholder" data-asset-id="${assetId}">Loading media...</span>`;
        }
        return `<p>(Error loading embedded media)</p>`;
      case 'embedded-entry-block':
        if (block.data.target.sys.contentType.sys.id === "summary") {
          return `<hr><h3>TLDR</h3><p>${renderText(block.content)}</p>`;
        }
        return "";
      default:
        return block.content ? renderText(block.content) : "";
    }
  }).join('');
}

function loadEmbeddedAssets() {
  const placeholders = document.querySelectorAll('.asset-placeholder');
  placeholders.forEach(placeholder => {
    const assetId = placeholder.getAttribute('data-asset-id');
    fetch(`/api/assets/${assetId}`)
      .then(response => response.json())
      .then(asset => {
        if (asset.fields && asset.fields.file && asset.fields.file.url) {
          let assetUrl = asset.fields.file.url;
          if (assetUrl.startsWith('//')) {
            assetUrl = 'https:' + assetUrl;
          }
          const altText = asset.fields.title || 'Embedded media';
          if (placeholder.classList.contains('asset-placeholder-header')) {
            placeholder.outerHTML = `<img src="${assetUrl}" alt="${altText}" class="post-header-image">`;
          } else {
            placeholder.outerHTML = `<img src="${assetUrl}" alt="${altText}" class="embedded-media">`;
          }
        } else {
          placeholder.outerHTML = `<p>(Error loading media)</p>`;
        }
      })
      .catch(err => {
        console.error('Error fetching asset:', err);
        placeholder.outerHTML = `<p>(Error loading media)</p>`;
      });
  });
}

function renderText(textArray) {
  if (!textArray) return ""; 

  return textArray.map(text => {
    if (text.nodeType === 'text') {
      let textValue = text.value.replace(/\n/g, "<br>"); 

      if (text.marks) {
        text.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              textValue = `<b>${textValue}</b>`;
              break;
            case 'italic':
              textValue = `<i>${textValue}</i>`;
              break;
            case 'underline':
              textValue = `<u>${textValue}</u>`;
              break;
            case 'strikethrough':
              textValue = `<s>${textValue}</s>`;
              break;
            case 'code':
              textValue = `<code>${textValue}</code>`;
              break;
          }
        });
      }
      return textValue;
    }
    if (text.nodeType === 'hyperlink') {
      const url = text.data.uri.startsWith("http") ? text.data.uri : `https://${text.data.uri}`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${renderText(text.content)}</a>`;
    }
    return "";
  }).join('');
}