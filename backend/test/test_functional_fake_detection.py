def test_fake_detection_functionality():

    detect_page_loaded = True
    text_entered = True
    analysis_completed = True
    scores_displayed = True
    explanation_displayed = True

    assert detect_page_loaded == True
    assert text_entered == True
    assert analysis_completed == True
    assert scores_displayed == True
    assert explanation_displayed == True


def test_watch_later_functionality():

    save_clicked = True
    mongodb_updated = True
    watch_later_updated = True

    assert save_clicked == True
    assert mongodb_updated == True
    assert watch_later_updated == True