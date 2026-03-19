<script lang="ts">
  import GlobeView from './lib/components/GlobeView.svelte';

  let viewMode = 'list'; // 'list' or 'globe'

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
    {#if viewMode === 'globe'}
      <GlobeView />
    {:else}
      <div class="list-view-placeholder">
        <h2>List View</h2>
        <p>This is the standard infinite-scroll Good/Bad feed.</p>
        <div class="article-card">
          <h3>Breakthrough in Fusion Energy</h3>
          <p class="summary">Scientists have achieved net-positive fusion...</p>
          <span class="label good">Good News</span>
        </div>
        <div class="article-card">
          <h3>Storm Causes Major Outages</h3>
          <p class="summary">Grid failures reported across the coast...</p>
          <span class="label bad">Bad News</span>
        </div>
      </div>
    {/if}
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
    position: relative;
    background: #12141a;
  }

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
