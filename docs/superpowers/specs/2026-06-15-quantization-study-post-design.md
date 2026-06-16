# Quantization Study Post — Design

**Date:** 2026-06-15
**Author:** Joe Ma (with Claude)
**Source material:** `~/Downloads/MIT_Lab2.ipynb` (MIT 6.5940 EfficientML.ai Lab 2: Quantization)
**Template:** `src/content/blog/nn-pruning-deep-dive.mdx`

## Goal

Publish a lab-driven study report on neural-network **quantization**, as a companion
to the existing pruning deep-dive. The post must read as a learning artifact backed by
**real measured results** from the lab, mirroring the pruning post's tone, structure,
and frontmatter conventions.

A cross-cutting theme — **PTQ (post-training quantization) vs QAT
(quantization-aware training)** — runs through the entire post.

## Working style: interactive teach-back

This post is written through an interactive **teach-back** loop, section by section.
For each section:

1. Before writing prose, Claude asks Joe to explain the core concept (or answer 1–2
   focused questions).
2. Joe answers; Claude checks it against the lab and corrects/refines the understanding.
3. Only then do they co-write that section.
4. No moving on to the next section until Joe is satisfied with the current one.

This is **not** handed off to a separate execution session — Joe stays in the loop the
whole way, since the point is to review and reinforce his own learning.

## Structure (mirrors the pruning post's three-part shape)

1. **Intro** — why quantize for edge deployment; FP32 baseline (92.95% accuracy,
   35.20 MiB).
2. **Why quantization works** — the weight-distribution insight reframed: weights occupy
   a narrow range with few perceptually distinct magnitudes, so a handful of bits can
   represent them.
3. **PTQ vs QAT** — short conceptual section. PTQ quantizes a trained model directly
   (optionally with calibration); QAT retrains so the network compensates for
   quantization error. Each later part names which regime it demonstrates.
4. **Part 1 — K-Means Quantization**
   - Concept: cluster weights into `2^n` centroids; codebook = centroids + labels.
   - Implementation: `k_means_quantize` (n_clusters = 2^bitwidth; decode via
     `centroids[labels]`).
   - Results table: 8/4/2-bit size + accuracy.
   - QAT: `update_codebook` (centroids recomputed as cluster means), why centroids drift,
     and the recovery story (4-bit 79.07% → 92.55%; 2-bit 10.00% → 91.25%).
   - Regime callout: 8-bit = PTQ (no retraining), 4/2-bit = QAT.
5. **Part 2 — Linear Quantization**
   - Concept: affine map `r = S(q − Z)`; deriving scale `S` and zero-point `Z`.
   - Implementation: `linear_quantize` (scale, round, shift by zero-point, clamp).
   - Integer-only inference: quantized conv/FC, bias scaling (`bias_scale = input_scale *
     weight_scale`), output rescaling, conv-bn fusion, and ReLU fusion (ReLU folded into
     output clamp).
   - Results: fused model 92.95%; int8 model 92.87%.
   - Regime callout: this path is PTQ via calibration; QAT is the lever if accuracy slips.
6. **Part 3 — The trade-off (k-means vs linear)** — built from Joe's Q10 answer.
   Comparison table including: compression ratio, hardware support / integer-only
   inference, decode overhead, and a **"retraining required?"** row tying back to PTQ/QAT.

## Measured results (from the notebook, to be used verbatim)

| Stage | Size | Accuracy |
|---|---|---|
| FP32 baseline | 35.20 MiB | 92.95% |
| K-means 8-bit | 8.80 MiB | 92.76% (PTQ, −0.19%) |
| K-means 4-bit | 4.40 MiB | 79.07% → 92.55% after QAT |
| K-means 2-bit | 2.20 MiB | 10.00% → 91.25% after 5 QAT epochs |
| Linear int8 (fused) | ~8.8 MiB | 92.87% (conv-bn fused fp model: 92.95%) |

Conceptual answers from the lab: Q2.1 = 16 colors; Q2.2 = 2ⁿ; ReLU is fused into the
preceding layer's output clamp; Q10 = k-means gives higher compression but needs a
custom decode, linear maps to native integer hardware and enables integer-only inference.

## Conventions

- File: `src/content/blog/quantization-deep-dive.mdx` (name TBD-confirmed).
- Frontmatter: `type: 'experiment'`, tags like
  `['aiml', 'pytorch', 'performance', 'model-compression']`, `pubDate: '2026-06-15'`.
- Diagrams: inline SVG/ASCII (as in `cnn-from-zero.mdx`), no external PNG dependencies.

## Out of scope (YAGNI)

- No new lab code or re-running CUDA (results are taken from the notebook outputs).
- No latency/MACs benchmark table (the quantization lab measures size + accuracy, not
  wall-clock latency, so we won't fabricate speedup numbers).
