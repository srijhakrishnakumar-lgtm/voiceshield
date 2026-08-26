def calculate_composite_risk(layer_a_score: float, layer_b_score: float) -> dict:
    """
    Calculates composite risk score from Layer A (acoustic/spectral) and Layer B (prosody/behavioral).

    Composite Formula:
        Risk = 0.6 * LayerA + 0.4 * LayerB

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

    composite_score = round(0.6 * layer_a_clean + 0.4 * layer_b_clean, 2)

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
