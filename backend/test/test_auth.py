def test_login():
    email = "test@gmail.com"
    password = "123456"

    assert email == "test@gmail.com"
    assert password == "123456"


def test_signup():
    username = "Hasitha"

    assert username != ""