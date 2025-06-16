<script setup lang="ts">
import { unResolve, unSignal } from 'unuse';
import type { Ref } from 'vue';
import { isRef } from 'vue';

const signal = unSignal<string>('Hello, World!');

const resolvedVueRef: Ref<string> = unResolve(signal);

const isVueRef = isRef(resolvedVueRef);

console.log('Resolved Vue Ref:', resolvedVueRef);
</script>

<template>
  <div class="app">
    <h1>Vue App</h1>
    <p>This is a simple Vue application.</p>
    <p>Signal Value: {{ resolvedVueRef }}</p>
    <p>Is a real Vue Ref: {{ isVueRef ? 'Yes' : 'No' }}</p>
  </div>
</template>
