# Design Spec: Neural Network Pruning Blog Post

This document specifies the design for the new blog post `src/content/blog/nn-pruning-deep-dive.mdx` based on the MIT 6.5940 Lab 1 Pruning assignment.

## Frontmatter
The post will contain the following YAML frontmatter:
```yaml
---
title: 'Neural network pruning — from fine-grained to channel pruning and everything in between'
description: 'A lab-driven exploration of neural network pruning: implementing fine-grained and channel pruning, sensitivity analysis, channel sorting, and the hardware trade-offs of sparse vs. structured weights.'
pubDate: '2026-06-08'
type: 'experiment'
tags: ['aiml', 'pytorch', 'performance', 'model-compression']
---
```

## Structure & Sections

### 1. Introduction
* **Goal:** Introduce model compression via pruning.
* **Context:** Deploying VGG on CIFAR-10. Baseline VGG has an accuracy of **92.95%** and a model size of **35.20 MiB**.
* **Rationale:** Large model sizes create prohibitive memory bandwidth, storage, and latency overheads for embedded or mobile devices.

### 2. Fine-Grained Pruning (Q1–Q5)
* **Weight Distributions (Q1):** 
  * *Q1.1:* Weights in deep neural networks typically form a zero-centered, bell-shaped (Gaussian-like) distribution.
  * *Q1.2:* Because the majority of weights are close to zero, pruning them (setting them to absolute zero) has a negligible impact on model accuracy while introducing sparsity.
* **Implementation (Q2):** Show the PyTorch implementation of `fine_grained_prune` using magnitude-based thresholding:
  ```python
  num_zeros = round(sparsity * num_elements)
  importance = torch.abs(tensor)
  threshold = importance.flatten().kthvalue(num_zeros)[0]
  mask = (importance > threshold).float()
  tensor.mul_(mask)
  ```
* **Sparsity Mapping (Q3):** Explain how to calculate sparsity of a tensor/model using the ratio of zero elements to total elements.
* **Sensitivity curves (Q4):**
  * *Q4.1:* The first convolutional layer (`conv0`) is highly sensitive because it extracts low-level, high-resolution spatial features (like edges, textures). Pruning it destroys essential input details.
  * *Q4.2:* The classifier layer (`classifier`) is very robust because it operates on high-level abstract representations and has high redundancy.
  * *Q4.3:* In general, deeper layers are less sensitive to pruning than shallower layers (excluding the very first input-facing layers).
* **Layer-by-Layer Sparsity (Q5):** Outline the custom layer sparsity configuration (`sparsity_dict`), explaining why we assign higher sparsity targets to larger, less sensitive layers (e.g. `conv7` and `classifier`) to maximize compression while keeping accuracy drop $< 0.5\%$.

### 3. Channel Pruning & Sorting (Q6–Q8)
* **Structured Pruning Concept:** Unlike unstructured fine-grained pruning, channel pruning actually removes entire rows/columns in weight matrices, reducing the physical tensor dimensions.
* **Naive Index Pruning (Q6):** Show how output/input channels are clipped to `n_keep = get_num_channels_to_keep(channels, prune_ratio)` by slicing dimensions.
* **Channel Sorting by L2 Norm (Q7):** 
  * Show the PyTorch code using `torch.norm(channel_weight)` to calculate channel importance.
  * Re-ordering the input channels of the subsequent layer based on descending importance so that the least important channels can be safely pruned from the end:
  ```python
  importance = get_input_channel_importance(next_conv.weight)
  sort_idx = torch.argsort(importance, descending=True)
  next_conv.weight.copy_(torch.index_select(next_conv.weight.detach(), 1, sort_idx))
  ```
* **Speedups vs. MACs (Q8):**
  * *Q8.1:* Pruning 30% of channels reduces FLOPs/MACs but the actual execution latency speedup on standard CPUs/GPUs is less than 30% due to non-computation overheads (memory bandwidth, overhead of small tensor shapes, kernel launching).
  * *Q8.2:* Pruning 70% of channels yields a larger speedup but drops accuracy significantly because VGG's capacity is severely reduced.

### 4. Trade-Off Analysis & Comparison (Q9)
* **Comparison Table (Q9):**
  | Metric | Fine-Grained (Unstructured) Pruning | Channel (Structured) Pruning |
  | :--- | :--- | :--- |
  | **Accuracy at High Sparsity** | High (acc drops slowly even at 80%+ sparsity) | Low (acc drops rapidly above 40-50% pruning) |
  | **Hardware Acceleration** | Requires custom sparse accelerators (e.g., NVIDIA Ampere sparse tensor cores) | Native speedup on standard CPUs, GPUs, and TPUs |
  | **Latency Reduction** | Zero speedup on standard dense matrix libraries | Immediate real-world speedup and memory usage reduction |
  | **Memory Indexing** | Requires coordinate storage (CSR/COO) or masks | No overhead; shapes are physically smaller |

## Implementation Plan
1. Create `/docs/superpowers/specs/2026-06-08-nn-pruning-design.md` (this spec).
2. Create `/src/content/blog/nn-pruning-deep-dive.mdx` using the detailed MDX format, incorporating custom styled markdown tables, clean LaTeX mathematical blocks, and inline code formatting.
3. Validate MDX formatting and layout structure by running Astro validation/build script.
