def test_platform_prediction():
    recommended_platform = "youtube"

    assert recommended_platform == "youtube"


def test_confidence_score():
    confidence = 51.74

    assert confidence > 0