<script lang="ts">
  import GlobeView from './lib/components/GlobeView.svelte';

  let viewMode = 'list'; // 'list' or 'globe'
  let currentTab = 'main'; // 'main', 'good', 'bad'
  let goodProportion = 50; // 50% Good, 50% Bad

  function toggleView() {
    viewMode = viewMode === 'list' ? 'globe' : 'list';
  }
</script>

<main class="app-container">
  <div class="sidebar">
    <h1>GoodNews BadNews</h1>
    <div class="topics">
      <h2>Topics</h2>
      <ul>
        <li><button class="topic-btn active">Technology</button></li>
        <li><button class="topic-btn">World</button></li>
        <li><button class="topic-btn">Climate</button></li>
      </ul>
    </div>
    <div class="settings">
      <h2>Feed Settings</h2>
      <label class="slider-label" for="feed-proportion">Main Feed Mix: {goodProportion}% Good</label>
      <input id="feed-proportion" type="range" min="0" max="100" bind:value={goodProportion} class="slider" />
    </div>
    <div class="view-toggle">
      <h2>View Mode</h2>
      <button class="toggle-btn" on:click={toggleView}>
        {viewMode === 'list' ? 'Switch to Globe View' : 'Switch to List View'}
      </button>
    </div>
    <div class="status-bar">
      <span>API: Connected</span>
      <span>HDF5: Ready</span>
    </div>
  </div>

  <div class="content-area">
    <div class="tabs-header">
      <button class="tab-btn {currentTab === 'main' ? 'active' : ''}" on:click={() => currentTab = 'main'}>Main Feed</button>
      <button class="tab-btn {currentTab === 'good' ? 'active' : ''}" on:click={() => currentTab = 'good'}>Only Good News</button>
      <button class="tab-btn {currentTab === 'bad' ? 'active' : ''}" on:click={() => currentTab = 'bad'}>Only Bad News</button>
    </div>

    <div class="tab-content">
      {#if viewMode === 'globe'}
        <!-- svelte-ignore a11y_missing_attribute -->
        <GlobeView {currentTab} {goodProportion} />
      {:else}
        <div class="list-view-placeholder">
          <h2>{currentTab.toUpperCase()} NEWS</h2>
          <p>The standard infinite-scroll feed will populate here based on user-learned votes, rather than auto-generation.</p>
          
          {#if currentTab === 'main' || currentTab === 'good'}
          <div class="article-card">
            <h3>Breakthrough in Fusion Energy</h3>
            <p class="summary">Scientists have achieved net-positive fusion...</p>
            <div class="vote-actions">
              <span class="label good">Voted Good</span>
            </div>
          </div>
          {/if}
          
          {#if currentTab === 'main' || currentTab === 'bad'}
          <div class="article-card">
            <h3>Storm Causes Major Outages</h3>
            <p class="summary">Grid failures reported across the coast...</p>
            <div class="vote-actions">
              <span class="label bad">Voted Bad</span>
            </div>
          </div>
          {/if}
          
          <div class="article-card unclassified">
            <h3>Unclassified: New AI Agent Discovered</h3>
            <p class="summary">A new native Wayland intelligence system is helping rewrite Rust code globally...</p>
            <div class="vote-actions">
              <button class="vote-btn btn-good">Vote Good</button>
              <button class="vote-btn btn-bad">Vote Bad</button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background-color: #12141A; /* System Dark */
    color: #e2e8f0;
  }

  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }

  .sidebar {
    width: 250px;
    background: #1A1D26; /* Midnight Black */
    border-right: 1px solid #353F5C; /* Deep Metallic Blue */
    display: flex;
    flex-direction: column;
    padding: 20px 0;
  }

  .sidebar h1 {
    font-family: 'Orbitron', sans-serif;
    color: #6DD4F2;
    font-size: 1.2rem;
    padding: 0 20px;
    margin-top: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .sidebar h2 {
    font-family: 'Rajdhani', sans-serif;
    color: #8b9bb4;
    font-size: 0.9rem;
    padding: 0 20px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .topics {
    flex-grow: 1;
    margin-top: 20px;
  }

  .topics ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .topic-btn {
    width: 100%;
    padding: 10px 20px;
    background: transparent;
    border: none;
    color: #e2e8f0;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
    font-family: 'Inter', sans-serif;
  }

  .topic-btn:hover {
    background: rgba(109, 212, 242, 0.1);
  }

  .topic-btn.active {
    background: rgba(109, 212, 242, 0.15);
    border-right: 3px solid #6DD4F2;
    color: #6DD4F2;
  }

  .settings {
    padding: 20px;
    border-top: 1px solid #353F5C;
  }

  .slider-label {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #8b9bb4;
    margin-bottom: 8px;
  }

  .slider {
    width: 100%;
    accent-color: #6DD4F2;
  }

  .view-toggle {
    padding: 20px;
    border-top: 1px solid #353F5C;
  }

  .toggle-btn {
    width: 100%;
    padding: 10px;
    background: #282D3A;
    border: 1px solid #353F5C;
    color: #6DD4F2;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Rajdhani', sans-serif;
    font-weight: 600;
    transition: all 0.2s;
  }

  .toggle-btn:hover {
    background: #353F5C;
    box-shadow: 0 0 8px rgba(109, 212, 242, 0.3);
  }

  .status-bar {
    padding: 15px 20px;
    border-top: 1px solid #353F5C;
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.75rem;
    color: #8b9bb4;
  }

  .content-area {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #12141a;
  }

  .tabs-header {
    display: flex;
    background: #1A1D26;
    border-bottom: 1px solid #353F5C;
    padding: 0 20px;
  }

  .tab-btn {
    padding: 15px 20px;
    background: transparent;
    border: none;
    color: #8b9bb4;
    font-family: 'Rajdhani', sans-serif;
    font-weight: bold;
    font-size: 1.1rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    color: #e2e8f0;
    background: rgba(255,255,255,0.05);
  }

  .tab-btn.active {
    color: #6DD4F2;
    border-bottom: 2px solid #6DD4F2;
  }

  .tab-content {
    flex-grow: 1;
    position: relative;
    overflow: auto;
  }

  .vote-actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }

  .vote-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    font-family: 'Rajdhani', sans-serif;
  }
  .btn-good { background: #00ff80; color: #1a1d26; }
  .btn-bad { background: #ff4040; color: #1a1d26; }

  .list-view-placeholder {
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  }

  .list-view-placeholder h2 {
    font-family: 'Rajdhani', sans-serif;
    font-size: 2rem;
    color: #e2e8f0;
    margin-bottom: 20px;
  }

  .article-card {
    background: #282D3A; /* Charcoal Steel */
    border: 1px solid #353F5C;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 16px;
    position: relative;
  }

  .article-card h3 {
    margin-top: 0;
    font-family: 'Rajdhani', sans-serif;
    color: #6DD4F2;
    font-size: 1.25rem;
  }

  .article-card .summary {
    color: #a0aec0;
    font-size: 0.95rem;
  }

  .label {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 10px;
  }

  .label.good { background: rgba(0, 255, 128, 0.15); color: #00ff80; border: 1px solid rgba(0, 255, 128, 0.3); }
  .label.bad { background: rgba(255, 64, 64, 0.15); color: #ff4040; border: 1px solid rgba(255, 64, 64, 0.3); }
</style>
