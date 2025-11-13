// ============================================
// S3 BUCKET CONFIGURATION
// ============================================
const S3_BUCKET_URL = 'https://time2hangout.s3.amazonaws.com';
const GALLERY_FOLDER = '/gallery';

// ============================================
// GALLERY INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const galleryGrid = document.getElementById('gallery-grid');
  const galleryLoading = document.getElementById('gallery-loading');
  const galleryError = document.getElementById('gallery-error');

  // Store loaded media for lightbox navigation
  let loadedMedia = [];
  let currentMediaIndex = 0;

  // Hardcoded list of images and videos to fetch
  const imageFiles = [];
  for (let i = 1; i <= 10; i++) {
    imageFiles.push(`img${i}.jpg`);
  }
  
  const videoFiles = ['vid1.mp4'];

  // Function to load gallery images and videos
  async function loadGalleryImages() {
    console.log('Starting gallery load...');
    console.log('S3 Bucket URL:', S3_BUCKET_URL);
    console.log('Gallery Folder:', GALLERY_FOLDER);
    
    galleryLoading.style.display = 'block';
    galleryError.style.display = 'none';

    let loadedCount = 0;
    let totalAttempts = imageFiles.length + videoFiles.length;
    let completedAttempts = 0;

    const checkCompletion = () => {
      completedAttempts++;
      if (completedAttempts >= totalAttempts) {
        galleryLoading.style.display = 'none';
        if (loadedCount === 0) {
          console.error('No media could be loaded. Please check:');
          console.error('1. S3 bucket URL is correct:', S3_BUCKET_URL);
          console.error('2. Files are in the /gallery folder');
          console.error('3. Bucket has public read access');
          galleryError.style.display = 'block';
        } else {
          console.log(`Successfully loaded ${loadedCount} media items`);
        }
      }
    };

    // Load images
    imageFiles.forEach((filename, index) => {
      const imageUrl = `${S3_BUCKET_URL}${GALLERY_FOLDER}/${filename}`;
      const img = new Image();
      
      img.onload = () => {
        console.log('Successfully loaded image:', filename);
        createGalleryItem(imageUrl, filename, 'image', loadedCount);
        loadedMedia.push({ url: imageUrl, filename, type: 'image' });
        loadedCount++;
        checkCompletion();
      };

      img.onerror = () => {
        console.warn(`Image not found or failed to load: ${filename}`);
        checkCompletion();
      };

      // Add a small delay to avoid too many simultaneous requests
      setTimeout(() => {
        img.src = imageUrl;
      }, index * 50);
    });

    // Load videos
    videoFiles.forEach((filename, index) => {
      const videoUrl = `${S3_BUCKET_URL}${GALLERY_FOLDER}/${filename}`;
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        console.log('Successfully loaded video:', filename);
        createGalleryItem(videoUrl, filename, 'video', loadedCount);
        loadedMedia.push({ url: videoUrl, filename, type: 'video' });
        loadedCount++;
        checkCompletion();
      };

      video.onerror = () => {
        console.warn(`Video not found or failed to load: ${filename}`);
        checkCompletion();
      };

      // Preload video metadata
      video.preload = 'metadata';
      video.src = videoUrl;
    });
  }

  // Create a gallery item (image or video)
  function createGalleryItem(mediaUrl, filename, type, index) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    galleryItem.style.opacity = '0';
    galleryItem.style.transform = 'scale(0.9)';
    
    if (type === 'image') {
      const img = document.createElement('img');
      img.src = mediaUrl;
      img.alt = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      img.loading = 'lazy';
      
      img.onload = () => {
        galleryItem.appendChild(img);
        galleryGrid.appendChild(galleryItem);
        
        // Add click handler for lightbox
        galleryItem.addEventListener('click', () => {
          openLightbox(index);
        });
        
        // Fade in animation
        setTimeout(() => {
          galleryItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          galleryItem.style.opacity = '1';
          galleryItem.style.transform = 'scale(1)';
        }, index * 50);
      };
    } else if (type === 'video') {
      const video = document.createElement('video');
      video.src = mediaUrl;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = 'metadata';
      
      // Create a play overlay icon
      const playOverlay = document.createElement('div');
      playOverlay.className = 'gallery-video-overlay';
      playOverlay.innerHTML = '▶';
      
      galleryItem.appendChild(video);
      galleryItem.appendChild(playOverlay);
      galleryGrid.appendChild(galleryItem);
      
      // Add click handler for lightbox
      galleryItem.addEventListener('click', () => {
        openLightbox(index);
      });
      
      // Hover to play preview
      galleryItem.addEventListener('mouseenter', () => {
        video.play().catch(e => console.warn('Video autoplay prevented:', e));
      });
      
      galleryItem.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
      });
      
      // Fade in animation
      setTimeout(() => {
        galleryItem.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        galleryItem.style.opacity = '1';
        galleryItem.style.transform = 'scale(1)';
      }, index * 50);
    }
  }

  // Lightbox functionality
  function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.id = 'gallery-lightbox';
    
    lightbox.innerHTML = `
      <div class="gallery-lightbox-content">
        <button class="gallery-lightbox-close" aria-label="Close">×</button>
        <button class="gallery-lightbox-nav gallery-lightbox-prev" aria-label="Previous">‹</button>
        <button class="gallery-lightbox-nav gallery-lightbox-next" aria-label="Next">›</button>
        <div id="lightbox-media-container"></div>
      </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Close handlers
    lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
    
    // Navigation handlers
    lightbox.querySelector('.gallery-lightbox-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(-1);
    });
    
    lightbox.querySelector('.gallery-lightbox-next').addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(1);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const lightbox = document.getElementById('gallery-lightbox');
      if (lightbox && lightbox.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });
    
    return lightbox;
  }

  function openLightbox(index) {
    if (loadedMedia.length === 0) return;
    
    let lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) {
      lightbox = createLightbox();
    }
    
    currentMediaIndex = index;
    updateLightboxMedia();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (lightbox) {
      // Stop any playing videos
      const video = lightbox.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function navigateLightbox(direction) {
    // Stop current video if playing
    const container = document.getElementById('lightbox-media-container');
    const currentVideo = container.querySelector('video');
    if (currentVideo) {
      currentVideo.pause();
      currentVideo.currentTime = 0;
    }
    
    currentMediaIndex += direction;
    
    if (currentMediaIndex < 0) {
      currentMediaIndex = loadedMedia.length - 1;
    } else if (currentMediaIndex >= loadedMedia.length) {
      currentMediaIndex = 0;
    }
    
    updateLightboxMedia();
  }

  function updateLightboxMedia() {
    const container = document.getElementById('lightbox-media-container');
    if (!container || !loadedMedia[currentMediaIndex]) return;
    
    const media = loadedMedia[currentMediaIndex];
    container.innerHTML = '';
    
    if (media.type === 'image') {
      const img = document.createElement('img');
      img.id = 'lightbox-image';
      img.src = media.url;
      img.alt = media.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      container.appendChild(img);
    } else if (media.type === 'video') {
      const video = document.createElement('video');
      video.id = 'lightbox-video';
      video.src = media.url;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      container.appendChild(video);
    }
  }

  // Initialize gallery
  loadGalleryImages();
});
