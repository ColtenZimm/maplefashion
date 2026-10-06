<script setup>
import { ref, computed } from 'vue'

// 1. Reactive state for the character's appearance
const skinId = ref(2000)       // 2000 is the classic light skin
const currentAction = ref('stand1') // Current animation loop
const selectedHat = ref(1002000)    // Default Hat ID (Classic Red Cap)

// 2. Pre-defined game assets to pick from
const actions = [
  { id: 'stand1', name: 'Standing' },
  { id: 'walk1', name: 'Walking' },
  { id: 'alert', name: 'Alert' },
  { id: 'prone', name: 'Prone (Crawling)' },
  { id: 'fly', name: 'Flying' }
]

const hatsList = [
  { id: 1002000, name: 'Red Ribbon Headband' },
  { id: 1002102, name: 'Wizet Hat' },
  { id: 1002140, name: 'Brown Bamboo Hat' },
  { id: 1002186, name: 'Zakum Helmet' },
  { id: 1003660, name: 'Pink Bean Hat' }
]

// 3. Computed Property to build the dynamic maplestory.io API string
const characterSpriteUrl = computed(() => {
  // Construct the JSON structure required by the API
  const characterPayload = {
    skin: skinId.value,
    frame: 0,
    action: currentAction.value,
    items: {
      hat: selectedHat.value
    }
  }

  // The API requires a stringified JSON token inside the URL path
  const jsonToken = encodeURIComponent(JSON.stringify(characterPayload))
  return `https://maplestory.io{jsonToken}/animated`
})
</script>

<template>
  <div class="container">
    <header class="app-header">
      <h1>🍁 MapleStory Fashion Studio</h1>
      <p>A dynamic character dressing room built with Vue 3</p>
    </header>

    <div class="studio-layout">
      <!-- Left side: The Live Sprite Canvas -->
      <div class="preview-card">
        <div class="sprite-display">
          <img 
            :src="characterSpriteUrl" 
            alt="MapleStory Character Preview"
            class="character-image" 
          />
        </div>
        <div class="current-meta">
          Action: <strong>{{ currentAction }}</strong> | Hat ID: <strong>{{ selectedHat }}</strong>
        </div>
      </div>

      <!-- Right side: Controls and Inventory Options -->
      <div class="controls-card">
        <!-- Animation Controls -->
        <section class="control-group">
          <h3>1. Choose Animation Loop</h3>
          <div class="button-grid">
            <button 
              v-for="action in actions" 
              :key="action.id"
              :class="{ active: currentAction === action.id }"
              @click="currentAction = action.id"
            >
              {{ action.name }}
            </button>
          </div>
        </section>

        <!-- Equipment Controls -->
        <section class="control-group">
          <h3>2. Equip a Hat</h3>
          <div class="item-list">
            <div 
              v-for="hat in hatsList" 
              :key="hat.id"
              class="item-row"
              :class="{ selected: selectedHat === hat.id }"
              @click="selectedHat = hat.id"
            >
              <!-- Fetching static item icons directly from the API asset database -->
              <img 
                :src="`https://maplestory.io{hat.id}/icon`" 
                alt="Hat icon" 
                class="item-icon"
              />
              <span class="item-name">{{ hat.name }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  margin-bottom: 0.5rem;
  color: #e67e22;
}

.studio-layout {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .studio-layout {
    grid-template-columns: 1fr;
  }
}

.preview-card {
  background: #f8f9fa;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.sprite-display {
  background: white;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.character-image {
  image-rendering: pixelated; /* Keeps the classic retro pixel-art crisp */
  transform: scale(1.5);      /* Scale up slightly for visibility */
}

.current-meta {
  font-size: 0.85rem;
  color: #64748b;
}

.controls-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.control-group {
  margin-bottom: 2rem;
}

.control-group h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 2px solid #edf2f7;
  padding-bottom: 0.5rem;
}

.button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button {
  background: #edf2f7;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

button:hover {
  background: #e2e8f0;
}

button.active {
  background: #e67e22;
  color: white;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.item-row:hover {
  background: #f7fafc;
}

.item-row.selected {
  border-color: #e67e22;
  background: #fffaf0;
}

.item-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 1rem;
}

.item-name {
  font-weight: 500;
  font-size: 0.95rem;
}
</style>