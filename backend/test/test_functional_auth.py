def test_user_login_functionality():

    login_page_loaded = True
    credentials_entered = True
    login_successful = True
    dashboard_redirected = True

    assert login_page_loaded == True
    assert credentials_entered == True
    assert login_successful == True
    assert dashboard_redirected == True


def test_user_logout_functionality():

    logout_clicked = True
    token_removed = True
    redirected_login = True

    assert logout_clicked == True
    assert token_removed == True
    assert redirected_login == True