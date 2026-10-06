<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { iconUrl, characterUrl, searchItems } from './api.js'

const currentAction = ref('stand1')
const actions = [
  { id: 'stand1', name: 'Standing' },
  { id: 'walk1', name: 'Walking' },
  { id: 'alert', name: 'Alert' },
  { id: 'prone', name: 'Prone' },
  { id: 'fly', name: 'Flying' }
]

// Skin isn't a searchable item, so it stays a short hardcoded list.
const skins = [
  { id: 2000, name: 'Light' }, { id: 2001, name: 'Tanned' },
  { id: 2002, name: 'Pale' }, { id: 2003, name: 'Dark' }
]

// Item slots, loaded from the API. `none` slots can be emptied.
const slots = [
  { key: 'hair', label: 'Hair', category: 'Character', sub: 'Hair' },
  { key: 'hat', label: 'Hat', category: 'Armor', sub: 'Hat', none: true },
  { key: 'overall', label: 'Overall', category: 'Armor', sub: 'Overall', none: true },
  { key: 'shoes', label: 'Shoes', category: 'Armor', sub: 'Shoes', none: true }
]

const skin = ref(2000)
const equipped = reactive({ hair: { id: 30000, name: 'Toben Hair' }, hat: null, overall: null, shoes: null })

const characterSrc = computed(() => {
  const ids = [
    skin.value, 10000 + skin.value, 20000, // body + matching head + default face
    ...slots.map(s => equipped[s.key]?.id)
  ].filter(Boolean)
  return characterUrl(ids, currentAction.value)
})

// Catalog browser for the active slot
const PAGE = 30
const activeKey = ref('hair')
const activeSlot = computed(() => slots.find(s => s.key === activeKey.value))
const search = ref('')
const items = ref([])
const loading = ref(false)
const error = ref('')
const hasMore = ref(false)
let latest = 0 // ignore responses from superseded requests
let timer

async function load(append = false) {
  const req = ++latest
  loading.value = true
  error.value = ''
  try {
    const page = await searchItems({
      ...activeSlot.value, search: search.value,
      start: append ? items.value.length : 0, count: PAGE
    })
    if (req !== latest) return
    items.value = append ? items.value.concat(page) : page
    hasMore.value = page.length === PAGE
  } catch {
    if (req === latest) error.value = 'Could not load items from maplestory.io.'
  } finally {
    if (req === latest) loading.value = false
  }
}

watch(activeKey, () => { search.value = ''; load() }, { immediate: true })
watch(search, () => { clearTimeout(timer); timer = setTimeout(load, 300) })

function pick(item) {
  const key = activeKey.value
  equipped[key] = activeSlot.value.none && equipped[key]?.id === item.id ? null : item
}
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
          <img :src="characterSrc" alt="MapleStory Character Preview" class="character-image" />
        </div>
        <div class="current-meta">
          <div v-for="s in slots" :key="s.key">
            {{ s.label }}: <strong>{{ equipped[s.key]?.name ?? 'None' }}</strong>
          </div>
        </div>
      </div>

      <div class="controls-card">
        <section class="control-group">
          <h3>Skin</h3>
          <div class="button-grid">
            <button
              v-for="s in skins" :key="s.id"
              :class="{ active: skin === s.id }"
              @click="skin = s.id"
            >{{ s.name }}</button>
          </div>
        </section>

        <section class="control-group">
          <h3>Pose</h3>
          <div class="button-grid">
            <button
              v-for="a in actions" :key="a.id"
              :class="{ active: currentAction === a.id }"
              @click="currentAction = a.id"
            >{{ a.name }}</button>
          </div>
        </section>

        <section class="control-group">
          <h3>Items</h3>
          <div class="button-grid">
            <button
              v-for="s in slots" :key="s.key"
              :class="{ active: activeKey === s.key }"
              @click="activeKey = s.key"
            >{{ s.label }}</button>
          </div>
          <input v-model="search" type="search" class="search" :placeholder="`Search ${activeSlot.label.toLowerCase()}…`" />
          <div class="item-list">
            <div
              v-for="item in items" :key="item.id"
              class="item-row"
              :class="{ selected: equipped[activeKey]?.id === item.id }"
              @click="pick(item)"
            >
              <img :src="iconUrl(item.id)" :alt="item.name" class="item-icon" loading="lazy" />
              <span class="item-name">{{ item.name }}</span>
            </div>
            <p v-if="error" class="status">{{ error }}</p>
            <p v-else-if="loading" class="status">Loading…</p>
            <p v-else-if="!items.length" class="status">No results.</p>
          </div>
          <button v-if="hasMore && !loading" @click="load(true)">Load more</button>
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

.item-list {
  max-height: 420px;
  overflow-y: auto;
}

.search {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  margin: 0.75rem 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.status {
  color: #64748b;
  font-size: 0.9rem;
}
</style>