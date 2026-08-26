def calculate_composite_risk(layer_a_score: float, layer_b_score: float) -> dict:
    """
    Calculates composite risk score from Layer A (acoustic/spectral) and Layer B (prosody/behavioral).

    Cross-Layer Validation:
        If Layer B score < 40.0 (prosody confirms organic human speech features like natural
        pitch modulation, tremor, and human pauses), any elevated spectral noise in Layer A
        is recognized as ambient microphone room hiss rather than a neural vocoder, applying
        a 30% noise-dampening adjustment to Layer A.

    Composite Formula:
        Risk = 0.6 * EffectiveLayerA + 0.4 * LayerB

    Thresholds & Action Mapping:
        - LOW (<35) -> PASS
        - MEDIUM (35-65) -> STEP_UP_MFA
        - HIGH (65-85) -> CALLBACK_VERIFY
        - CRITICAL (>85) -> BLOCK_TRANSACTION

    Args:
        layer_a_score (float): Normalized score 0 - 100
        layer_b_score (float): Normalized score 0 - 100

    Returns:
        dict: {
            "composite_score": float,
            "verdict": str,
            "recommended_action": str
        }
    """
    layer_a_clean = max(0.0, min(100.0, float(layer_a_score)))
    layer_b_clean = max(0.0, min(100.0, float(layer_b_score)))

    # Cross-layer noise dampening: If prosody is demonstrably organic (Layer B < 40),
    # dampen high-frequency room mic noise in Layer A by 30%.
    if layer_b_clean < 40.0:
        effective_layer_a = layer_a_clean * 0.70
    else:
        effective_layer_a = layer_a_clean

    composite_score = round(0.6 * effective_layer_a + 0.4 * layer_b_clean, 2)

    if composite_score < 35.0:
        verdict = "LOW"
        action = "PASS"
    elif composite_score <= 65.0:
        verdict = "MEDIUM"
        action = "STEP_UP_MFA"
    elif composite_score <= 85.0:
        verdict = "HIGH"
        action = "CALLBACK_VERIFY"
    else:
        verdict = "CRITICAL"
        action = "BLOCK_TRANSACTION"

    return {
        "composite_score": composite_score,
        "verdict": verdict,
        "recommended_action": action
    }
