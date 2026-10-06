<script setup>
import { reactive, ref, computed } from 'vue'

// All API calls hang off this one base: region + game version.
const API = 'https://maplestory.io/api'
const VERSION = { region: 'GMS', version: '255' }

const currentAction = ref('stand1')
const actions = [
  { id: 'stand1', name: 'Standing' },
  { id: 'walk1', name: 'Walking' },
  { id: 'alert', name: 'Alert' },
  { id: 'prone', name: 'Prone' },
  { id: 'fly', name: 'Flying' }
]

// One entry per slot; `none` lets the slot be empty. Item IDs verified against GMS 255.
const slots = [
  { key: 'skin', label: 'Skin', icon: false, options: [
    { id: 2000, name: 'Light' }, { id: 2001, name: 'Tanned' },
    { id: 2002, name: 'Pale' }, { id: 2003, name: 'Dark' } ] },
  { key: 'hair', label: 'Hair', options: [
    { id: 30000, name: 'Toben Hair' }, { id: 30020, name: 'Unkempt Hair' },
    { id: 30030, name: 'Shaved Hair' }, { id: 31000, name: 'Cutie Hair' },
    { id: 31030, name: 'Black Polly' } ] },
  { key: 'hat', label: 'Hat', none: true, options: [
    { id: 1002000, name: 'Brown Flight Headgear' }, { id: 1002102, name: 'Blue Moon Conehat' },
    { id: 1002140, name: 'Wizet Invincible Hat' }, { id: 1002357, name: 'Zakum Helmet' } ] },
  { key: 'overall', label: 'Overall', none: true, options: [
    { id: 1050000, name: 'White Crusader Chainmail' }, { id: 1051017, name: 'Red Sauna Robe' },
    { id: 1052000, name: 'Recycled Box' } ] },
  { key: 'shoes', label: 'Shoes', none: true, options: [
    { id: 1070000, name: 'Blue Gomushin' }, { id: 1072001, name: 'Red Rubber Boots' },
    { id: 1072005, name: 'Leather Sandals' }, { id: 1072018, name: 'Blue Sneakers' } ] }
]

// slot key -> equipped item ID (null = empty)
const equipped = reactive({
  skin: 2000, hair: 30000, hat: null, overall: null, shoes: null
})

// The character endpoint takes comma-separated URL-encoded {itemId, version} objects.
const characterUrl = computed(() => {
  const ids = [
    equipped.skin, 10000 + equipped.skin, // body + matching head
    20000,                                // default face
    equipped.hair, equipped.hat, equipped.overall, equipped.shoes
  ].filter(Boolean)
  const items = ids
    .map(itemId => encodeURIComponent(JSON.stringify({ itemId, version: VERSION.version })))
    .join(',')
  return `${API}/character/${items}/${currentAction.value}/0`
})

const iconUrl = id => `${API}/${VERSION.region}/${VERSION.version}/item/${id}/icon`
</script>

<template>
  <div class="container">
    <header class="app-header">
      <h1>🍁 MapleStory Fashion Studio</h1>
      <p>A dynamic character dressing room built with Vue 3</p>
    </header>

    <div class="studio-layout">
      <div class="preview-card">
        <div class="sprite-display">
          <img :src="characterUrl" alt="MapleStory Character Preview" class="character-image" />
        </div>
        <div class="current-meta">Action: <strong>{{ currentAction }}</strong></div>
      </div>

      <div class="controls-card">
        <section class="control-group">
          <h3>Pose</h3>
          <div class="button-grid">
            <button
              v-for="action in actions"
              :key="action.id"
              :class="{ active: currentAction === action.id }"
              @click="currentAction = action.id"
            >{{ action.name }}</button>
          </div>
        </section>

        <section v-for="slot in slots" :key="slot.key" class="control-group">
          <h3>{{ slot.label }}</h3>
          <div class="item-list">
            <div
              v-if="slot.none"
              class="item-row"
              :class="{ selected: equipped[slot.key] === null }"
              @click="equipped[slot.key] = null"
            ><span class="item-name">None</span></div>
            <div
              v-for="item in slot.options"
              :key="item.id"
              class="item-row"
              :class="{ selected: equipped[slot.key] === item.id }"
              @click="equipped[slot.key] = item.id"
            >
              <img v-if="slot.icon !== false" :src="iconUrl(item.id)" :alt="item.name" class="item-icon" />
              <span class="item-name">{{ item.name }}</span>
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