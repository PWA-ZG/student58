const shareButton = document.querySelector('#btnShare');

  const files = [];
  let title = 'ProjectTaskTracker';
  let description = 'Aplikacija prati zadatke na nekom projektu';
  let url = 'https://webprojekt5.onrender.com';

  const data = {title, description, url};

shareButton.addEventListener('click', async () => {
    try {
        await navigator.share(data);
    }
    catch(e) {
        console.log('share error', e);
    }
});

   