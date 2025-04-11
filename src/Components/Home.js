import React, { useState } from 'react';
import { searchImages } from '../Api/Api';
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

const Home = () => {
  const navigate = useNavigate();   
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query) {
      setError('Please enter a search term');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const results = await searchImages(query);
        console.log(results);
      setImages(results);
      if (results.length === 0) {
        setError('No images found. Try a different search term.');
      }
    } catch (err) {
      setError(`Error fetching images: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    navigate('/editor' , { state: { imageUrl } });
  };

  return (
    <div className={styles.homeContainer}>
      <section className={styles.searchSection}>
        <div className={styles.searchHeader}>
          <h2>Find the perfect image to customize</h2>
        </div>
        <form className={styles.searchContainer} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for images..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
           
            Search
          </button>
        </form>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        {isLoading ? (
          <Loading />
              ): (
          <div className={styles.resultsGrid}>
            {images.map((image) => (
              <div key={image.id} className={styles.imageCard}>
                <div className={styles.imageWrapper}>
                  <img src={image.src.medium} alt={image.alt} />
                  <div className={styles.imageOverlay}>
                    <button 
                      className={styles.editButton}
                      onClick={() => handleImageSelect(image.src.large2x)}
                    >
                      Add Caption
                    </button>
                  </div>
                </div>
               
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
