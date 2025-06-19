class GrObjection < Formula
  desc "Objection is a powerful tool for reverse engineering Android applications."
  homepage ""
  version "2.0.0-gr"

  depends_on "pipx"

  url "https://github.com/Good-Research/objection/releases/download/v#{version}/objection-2.0.0-py3-none-any.whl"
  sha256 "1532697ed88e0ccf66309c5099f611d0244366e9cce4605dfd961d2f11ec0afb"

  def install
    ENV["PIPX_HOME"] = libexec
    ENV["PIPX_BIN_DIR"] = bin
    system "pipx", "install", "--pip-args", "'--no-cache-dir --force-reinstall'", "objection-2.0.0-py3-none-any.whl", "--force"
  end

  def caveats
    <<~EOS
      The `objection` executable has been installed by pipx.
      Make sure that `~/.local/bin` is in your PATH.
      You can run `pipx ensurepath` to add it.
    EOS
  end
end
