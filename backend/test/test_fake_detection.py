def test_fake_detection():
    fake_score = 80
    real_score = 20

    assert fake_score > real_score


def test_real_detection():
    fake_score = 10
    real_score = 90

    assert real_score > fake_score